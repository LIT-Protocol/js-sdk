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
  reason: string;
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

    if (name === 'NoValidShares') {
      return true;
    }

    return (
      typeof message === 'string' &&
      message.toLowerCase().includes('no valid lit action shares to combine')
    );
  };
}

const deriveRetryMetadata = (error: unknown): RetryMetadata => {
  if (EdgeCase.isMissingVerificationKeyError(error)) {
    return { shouldRetry: true, reason: 'missing-verification-key' };
  }

  if (EdgeCase.isNetworkFetchError(error)) {
    return { shouldRetry: true, reason: 'network-fetch-error' };
  }

  if (EdgeCase.isNoValidSharesError(error)) {
    return { shouldRetry: true, reason: 'no-valid-shares' };
  }

  return { shouldRetry: false, reason: '' };
};

export const executeWithHandshake = async <ReturnType>(
  options: ExecuteWithHandshakeOptions<ReturnType>
): Promise<ReturnType> => {
  const { operation, buildContext, refreshContext, runner } = options;

  let context = await buildContext();

  try {
    return await runner(context);
  } catch (error) {
    const retryMetadata = deriveRetryMetadata(error);

    if (retryMetadata.shouldRetry) {
      const reason = retryMetadata.reason || 'retry';
      const refreshLabel = `${operation}-${reason}`.replace(/-+/g, '-');

      _logger.warn(
        {
          error,
          operation,
          retryReason: reason,
        },
        `${operation} failed; refreshing handshake (${refreshLabel}) and retrying once.`
      );
      context = await refreshContext(refreshLabel);
      return await runner(context);
    }

    throw error;
  }
};
