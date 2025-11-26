import { getChildLogger } from '@lit-protocol/logger';
import type { OrchestrateHandshakeResponse } from '../orchestrateHandshake';

const _logger = getChildLogger({
  module: 'executeWithHandshake',
});

export interface HandshakeExecutionContext {
  handshakeResult: OrchestrateHandshakeResponse;
  connectionInfo: any;
  jitContext: any;
}

export interface ExecuteWithHandshakeOptions<ReturnType> {
  operation: string;
  buildContext: () => Promise<HandshakeExecutionContext>;
  refreshContext: (reason: string) => Promise<HandshakeExecutionContext>;
  runner: (context: HandshakeExecutionContext) => Promise<ReturnType>;
}

type RetryMetadata = {
  shouldRetry: boolean;
  reason: RetryReason | '';
};

// Pause briefly before retrying so dropped nodes have time to deregister and surviving owners rebroadcast shares.
const RETRY_BACKOFF_MS = 1_000;

export const RETRY_REASONS = {
  missingVerificationKey: 'missing-verification-key',
  networkFetch: 'network-fetch-error',
  noValidShares: 'no-valid-shares',
  generic: 'retry',
} as const;

type RetryReason = (typeof RETRY_REASONS)[keyof typeof RETRY_REASONS];

const DEFAULT_RETRY_BUDGET: Record<RetryReason, number> = {
  [RETRY_REASONS.missingVerificationKey]: 1,
  [RETRY_REASONS.networkFetch]: 3,
  // Allow a longer grace period for the cluster to re-aggregate shares after node churn.
  [RETRY_REASONS.noValidShares]: 6,
  [RETRY_REASONS.generic]: 0,
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const computeBackoffDelay = (reason: RetryReason, attempt: number): number => {
  if (reason === RETRY_REASONS.missingVerificationKey) {
    return 0;
  }
  return RETRY_BACKOFF_MS * Math.max(1, attempt);
};

export namespace EdgeCase {
  export const isMissingVerificationKeyError = (error: unknown): boolean => {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const message = (error as any).message;
    const causeMessage = (error as any).cause?.message;
    const infoVerificationKey = (error as any).info?.verificationKey;

    const messages = [message, causeMessage].filter(
      (text): text is string => typeof text === 'string'
    );

    if (
      messages.some((text) =>
        text.includes('No secret key found for verification key')
      )
    ) {
      return true;
    }

    return (
      typeof infoVerificationKey === 'string' &&
      messages.some((text) =>
        text.includes('No secret key found for verification key')
      )
    );
  };

  export const isNetworkFetchError = (error: unknown): boolean => {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const name = (error as any).name;
    const code = (error as any).code;
    const infoFullPath = (error as any).info?.fullPath;
    const messages = [
      (error as any).message,
      (error as any).cause?.message,
    ].filter((text): text is string => typeof text === 'string');

    if (name === 'NetworkError' || code === 'network_error') {
      return true;
    }

    if (
      messages.some((text) => text.toLowerCase().includes('fetch failed')) ||
      (typeof infoFullPath === 'string' &&
        infoFullPath.toLowerCase().includes('execute'))
    ) {
      return true;
    }

    return false;
  };

  export const isNoValidSharesError = (error: unknown): boolean => {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const name = (error as any).name;
    const message = (error as any).message as string | undefined;
    const causeMessage = (error as any).cause?.message as string | undefined;

    if (name === 'NoValidShares') {
      return true;
    }

    const errorMessages = [message, causeMessage]
      .filter((text): text is string => typeof text === 'string')
      .map((text) => text.toLowerCase());

    return errorMessages.some(
      (text) =>
        text.includes('no valid lit action shares to combine') ||
        text.includes('could not read key share') ||
        text.includes('unable to insert into key cache') ||
        text.includes('ecdsa signing failed')
    );
  };
}

const deriveRetryMetadata = (error: unknown): RetryMetadata => {
  if (EdgeCase.isMissingVerificationKeyError(error)) {
    return {
      shouldRetry: true,
      reason: RETRY_REASONS.missingVerificationKey,
    };
  }

  if (EdgeCase.isNetworkFetchError(error)) {
    return { shouldRetry: true, reason: RETRY_REASONS.networkFetch };
  }

  if (EdgeCase.isNoValidSharesError(error)) {
    return { shouldRetry: true, reason: RETRY_REASONS.noValidShares };
  }

  return { shouldRetry: false, reason: '' };
};

export const executeWithHandshake = async <ReturnType>(
  options: ExecuteWithHandshakeOptions<ReturnType>
): Promise<ReturnType> => {
  const { operation, buildContext, refreshContext, runner } = options;

  const initialRetryBudget: Record<RetryReason, number> = {
    ...DEFAULT_RETRY_BUDGET,
  };
  const retryBudget: Record<RetryReason, number> = {
    ...DEFAULT_RETRY_BUDGET,
  };

  let context = await buildContext();

  // Retry loop: continue until the runner succeeds or we exhaust retry budgets.
  for (;;) {
    try {
      _logger.warn(
        { operation, retryBudget },
        `[executeWithHandshake] running ${operation} with remaining budget`
      );
      return await runner(context);
    } catch (error: unknown) {
      const retryMetadata = deriveRetryMetadata(error);
      if (!retryMetadata.shouldRetry) {
        throw error;
      }

      const reason = (retryMetadata.reason ||
        RETRY_REASONS.generic) as RetryReason;

      const remainingBudget = retryBudget[reason] ?? 0;
      if (remainingBudget <= 0) {
        throw error;
      }

      retryBudget[reason] = remainingBudget - 1;
      const attemptIndex =
        (initialRetryBudget[reason] ?? 0) - remainingBudget + 1;
      const refreshLabel =
        `${operation}-${reason}-retry-${attemptIndex}`.replace(/-+/g, '-');

      const retryDelayMs = computeBackoffDelay(reason, attemptIndex);

      if (retryDelayMs > 0) {
        _logger.warn(
          { operation, retryDelayMs, attempt: attemptIndex },
          `[executeWithHandshake] backing off ${retryDelayMs}ms before retry ${attemptIndex} for ${operation}`
        );
        await sleep(retryDelayMs);
      }

      _logger.warn(
        {
          operation,
          retryReason: reason,
          attempt: attemptIndex,
          remainingAttempts: retryBudget[reason] ?? 0,
        },
        `[executeWithHandshake] retrying ${operation} due to ${reason} (attempt ${attemptIndex}, remaining ${retryBudget[reason]})`
      );

      context = await refreshContext(refreshLabel);
    }
  }
};
