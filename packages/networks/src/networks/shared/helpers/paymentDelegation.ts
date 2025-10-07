import { getChildLogger } from '@lit-protocol/logger';

const logger = getChildLogger({ name: 'paymentDelegationHelper' });

const trimTrailingSlash = (url: string) =>
  url.endsWith('/') ? url.slice(0, -1) : url;

const parseResponseBody = (payload: string) => {
  if (!payload) return undefined;
  try {
    return JSON.parse(payload);
  } catch {
    return payload;
  }
};

/**
 * Request payload used when asking the Auth Service to initialise a payer wallet.
 * `apiKey` mirrors the header consumed by the Express routes.
 */
export interface RegisterPayerParams {
  /** Base URL of the auth service instance (no trailing slash needed). */
  authServiceBaseUrl: string;
  /** API key that the auth service expects in the `x-api-key` header. */
  apiKey: string;
}

/**
 * Successful response payload returned by the auth service when a payer is
 * registered. The `payerSecretKey` must be persisted securely by the caller; it is
 * required for subsequent delegation calls.
 */
export interface RegisterPayerResult {
  success: boolean;
  payerWalletAddress: string;
  payerSecretKey: string;
}

export const registerPayerWithAuthService = async (
  params: RegisterPayerParams
): Promise<RegisterPayerResult> => {
  const endpoint = `${trimTrailingSlash(
    params.authServiceBaseUrl
  )}/register-payer`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': params.apiKey,
    },
    body: JSON.stringify({}),
  });

  const rawBody = await res.text();
  const parsedBody = parseResponseBody(rawBody);

  if (!res.ok) {
    logger.error(
      { status: res.status, body: parsedBody },
      'registerPayer failed'
    );
    throw new Error(
      `Auth service register-payer request failed (status ${res.status}). ${
        typeof parsedBody === 'string' ? parsedBody : JSON.stringify(parsedBody)
      }`
    );
  }

  if (
    !parsedBody ||
    typeof parsedBody !== 'object' ||
    !('payerWalletAddress' in parsedBody) ||
    !('payerSecretKey' in parsedBody)
  ) {
    throw new Error(
      'Auth service register-payer response missing required fields.'
    );
  }

  const typedBody = parsedBody as RegisterPayerResult;

  if (!typedBody.success) {
    throw new Error('Auth service register-payer reported failure.');
  }

  return typedBody;
};

/**
 * Request payload used when delegating payments for a set of users via the auth
 * service. The order of `userAddresses` is preserved and forwarded directly to the
 * PaymentManager's batch delegation call.
 */
export interface DelegateUsersParams {
  /** Base URL of the auth service instance (no trailing slash needed). */
  authServiceBaseUrl: string;
  /** API key that the auth service expects in the `x-api-key` header. */
  apiKey: string;
  /** Payer secret issued during `/register-payer`. */
  payerSecretKey: string;
  /** Array of EVM addresses to delegate payments to. */
  userAddresses: string[];
}

/**
 * The auth service returns a transaction hash and optional message once the
 * delegation transaction has been submitted to the Payment Delegation contract.
 */
export interface DelegateUsersResult {
  success: boolean;
  txHash: string;
  message?: string;
}

export const delegateUsersWithAuthService = async (
  params: DelegateUsersParams
): Promise<DelegateUsersResult> => {
  const endpoint = `${trimTrailingSlash(params.authServiceBaseUrl)}/add-users`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': params.apiKey,
      'payer-secret-key': params.payerSecretKey,
    },
    body: JSON.stringify(params.userAddresses),
  });

  const rawBody = await res.text();
  const parsedBody = parseResponseBody(rawBody);

  if (!res.ok) {
    logger.error(
      { status: res.status, body: parsedBody },
      'delegateUsers failed'
    );
    throw new Error(
      `Auth service add-users request failed (status ${res.status}). ${
        typeof parsedBody === 'string' ? parsedBody : JSON.stringify(parsedBody)
      }`
    );
  }

  if (
    !parsedBody ||
    typeof parsedBody !== 'object' ||
    !('txHash' in parsedBody)
  ) {
    throw new Error('Auth service add-users response missing required fields.');
  }

  const typedBody = parsedBody as DelegateUsersResult;

  if (!typedBody.success) {
    throw new Error('Auth service add-users reported failure.');
  }

  return typedBody;
};
