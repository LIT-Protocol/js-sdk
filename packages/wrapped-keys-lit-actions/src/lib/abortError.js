export class AbortError extends Error {
  name = 'AbortError';
}

export const rethrowIfAbortError = (err) => {
  if (err instanceof AbortError) {
    throw err;
  }
};
