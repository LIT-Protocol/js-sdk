export class AbortError extends Error {
  override name = 'AbortError';
}

export const rethrowIfAbortError = (err: any) => {
  if (err instanceof AbortError) {
    throw err;
  }
};
