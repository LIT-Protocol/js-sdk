export class AbortError extends Error {
  override name = 'AbortError';
}

export const rethrowIfAbortError = (err: unknown) => {
  if (err instanceof AbortError) {
    throw err;
  }
};
