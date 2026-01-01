export const SIGN_ECDSA_LIT_ACTION_CODE = `
(async () => {
  const { sigName, toSign, publicKey } = jsParams;
  const { keccak256, arrayify } = ethers.utils;

  const toSignBytes = new TextEncoder().encode(toSign);
  const toSignBytes32 = keccak256(toSignBytes);
  const toSignBytes32Array = arrayify(toSignBytes32);

  await Lit.Actions.signEcdsa({
    toSign: toSignBytes32Array,
    publicKey,
    sigName,
  });
})();`;

const DEFAULT_TRANSIENT_FRAGMENTS = [
  'Rate Limit Exceeded',
  'rate limit',
  '429',
] as const;

export const PKP_SIGN_TRANSIENT_FRAGMENTS = [
  ...DEFAULT_TRANSIENT_FRAGMENTS,
  'Pubkey share not found',
  'unable to get signature share',
  'NodeUnknownError',
] as const;

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    baseDelayMs?: number;
    transientMessageFragments?: readonly string[];
  } = {}
): Promise<T> {
  const {
    retries = 3,
    baseDelayMs = 1500,
    transientMessageFragments = DEFAULT_TRANSIENT_FRAGMENTS,
  } = options;

  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const message = String(err?.message ?? err);
      const isTransient = transientMessageFragments.some((fragment) =>
        message.includes(fragment)
      );

      if (isTransient && attempt < retries) {
        const delay = baseDelayMs * attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw err;
    }
  }

  throw lastError;
}
