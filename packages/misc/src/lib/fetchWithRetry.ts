import fetchRetry, { FetchLibrary, RequestDelayFunction } from 'fetch-retry';

export type RetryDelayHandlerFactory<T extends FetchLibrary> = (
  interval: number
) => RequestDelayFunction<T>;

// Intentionally not retrying on `500` since LIT nodes may return 500 in cases where retrying would have negative effect
export const RETRYABLE_STATUS_CODES = [408, 502, 503, 504];

/** Return a function to be used as `retryDelay` for `fetch-retry`
 * Retry function uses exponential backoff and jitter to avoid stampeding herd issues
 *
 * @param {number} interval How long to use as a base (minimum) retry delay between requests
 * @returns {RequestDelayFunction} A retry delay handler function for the provided interval
 */
export const getRetryDelayHandlerForInterval: RetryDelayHandlerFactory<
  typeof globalThis.fetch
> = (interval: number) => {
  return function getRetryDelay(
    attempt: number
    // error: Error | null,
    // response: Response | null
  ) {
    return Math.random() * (Math.pow(2, attempt) * interval);
  };
};

export const DEFAULT_RETRY_CONFIG = {
  retries: 3,
  retryDelay: getRetryDelayHandlerForInterval(250),
  retryOn: RETRYABLE_STATUS_CODES,
};

/** defaultRetryDelayHandler has a 250ms interval, using exponential backoff with jitter
 * @returns {number}
 */
export const defaultRetryDelayHandler = getRetryDelayHandlerForInterval(250);

export const fetchWithRetries = fetchRetry(
  globalThis.fetch,
  DEFAULT_RETRY_CONFIG
);
