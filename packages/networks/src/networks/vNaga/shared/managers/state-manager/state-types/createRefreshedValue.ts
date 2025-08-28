import { getChildLogger } from '@lit-protocol/logger';

export type FetchFn<T> = () => Promise<T>;

export interface RefreshedValue<T> {
  getOrRefreshAndGet: () => Promise<T>;
}

export interface CreateRefreshedValueOptions<T> {
  fetch: FetchFn<T>;
  ttlMs: number;
}

/**
 * This function is designed to avoid re-fetching data too frequently.
 * It ensures that when you ask for data, you get a reasonably fresh version if the old one
 * has expired, and avoid the complexity of constant bg polling if the data isn't being
 * actively requested.
 */
export const createRefreshedValue = <T>({
  fetch,
  ttlMs,
  debug = true,
}: CreateRefreshedValueOptions<T> & { debug?: boolean }): RefreshedValue<T> => {
  const _logger = getChildLogger({
    module: 'createRefreshedValue',
    ...(debug ? { level: 'debug' } : {}),
  });

  let value: T | undefined = undefined;
  let lastUpdatedAt: number = 0; // Initialize to ensure first fetch attempt

  // console.log(`[RefreshedValue] Initialized. Initial value:`, value, `TTL: ${ttlMs}ms`);

  const _set = (newValue: T) => {
    value = newValue;
    lastUpdatedAt = Date.now();
    _logger.debug(
      `[RefreshedValue] Value successfully updated via _set. Last updated at: ${lastUpdatedAt}`
    );
  };

  const getOrRefreshAndGet = async (): Promise<T> => {
    const now = Date.now();
    // Check if lastUpdatedAt is non-null before using it in calculation
    const age = lastUpdatedAt ? now - lastUpdatedAt : Infinity;
    const isExpired = age >= ttlMs;

    // Fetch if value is uninitialized (first run) or if it's expired.
    if (value === undefined || isExpired) {
      let reason = '';
      if (value === undefined) {
        reason = 'Initial fetch required.';
      } else {
        // isExpired must be true
        reason = `Value is stale (age: ${age}ms, TTL: ${ttlMs}ms). Attempting refresh.`;
      }
      _logger.debug(`[RefreshedValue] ${reason}`);

      try {
        const freshValue = await fetch();
        _set(freshValue);
        return freshValue;
      } catch (err) {
        _logger.error(`[RefreshedValue] Fetch attempt failed. Error:`, err);
        if (value === undefined) {
          // If it's the first fetch and it failed, there's no fallback.
          _logger.error(
            `[RefreshedValue] Initial fetch failed. Rethrowing error.`
          );
          throw err; // Propagate the error
        }
        // If a subsequent refresh failed, log and return the stale 'value'.
        _logger.warn(
          `[RefreshedValue] Refresh failed. Returning previously cached (stale) value.`
        );
        // 'value' here is the last successfully fetched value, guaranteed to be T.
        return value;
      }
    } else {
      // Value is not undefined and not expired
      _logger.debug(
        `[RefreshedValue] Value is fresh (age: ${age}ms, TTL: ${ttlMs}ms). Returning cached value.`
      );
      // 'value' is guaranteed to be T because it's not undefined and not expired.
      return value;
    }
  };

  return { getOrRefreshAndGet };
};
