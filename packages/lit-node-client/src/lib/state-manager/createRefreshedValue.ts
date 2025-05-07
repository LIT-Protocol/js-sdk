import { getChildLogger } from '@lit-protocol/logger';

export type FetchFn<T> = () => Promise<T>;

export interface RefreshedValue<T> {
  getOrRefreshAndGet: () => Promise<T>;
}

export interface CreateRefreshedValueOptions<T> {
  fetch: FetchFn<T>;
  ttlMs: number;
  initialValue: T;
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
  initialValue,
  debug = false,
}: CreateRefreshedValueOptions<T> & { debug?: boolean }): RefreshedValue<T> => {
  const _logger = getChildLogger({
    module: 'createRefreshedValue',
    ...(debug ? { level: 'debug' } : {}),
  });

  let value: T = initialValue;
  let lastUpdatedAt: number = Date.now();

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
    const expired = age >= ttlMs;

    if (expired) {
      _logger.debug(
        `[RefreshedValue] Value is stale (age: ${age}ms, TTL: ${ttlMs}ms). Attempting refresh.`
      );
      try {
        const fresh = await fetch();
        _set(fresh); // _set will log on success
      } catch (err) {
        _logger.error(
          `[RefreshedValue] Refresh attempt failed. Error:`,
          err,
          `Returning previous/initial value.`
        );
        // No update to value or lastUpdatedAt on error
      }
    } else {
      _logger.debug(
        `[RefreshedValue] Value is fresh (age: ${age}ms, TTL: ${ttlMs}ms). Returning cached value.`
      );
    }

    return value;
  };

  return { getOrRefreshAndGet };
};
