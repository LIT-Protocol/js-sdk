import { createRefreshedValue, RefreshedValue } from './createRefreshedValue';

describe('createRefreshedValue', () => {
  const ttlMs = 3000;
  let fetchCounter: number;
  let fetchFn: jest.Mock<Promise<number>, []>;
  let refreshed: RefreshedValue<number>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchCounter = 0;
    fetchFn = jest.fn(async () => {
      fetchCounter += 1;
      return fetchCounter;
    });
    refreshed = createRefreshedValue({
      fetch: fetchFn,
      ttlMs,
    });
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    consoleErrorSpy.mockRestore();
  });

  it('getOrRefreshAndGet should return the expected sequence of cached and fetched values', async () => {
    jest.useFakeTimers();
    let currentValue;
    // For ttlMs = 3000ms: halfTtl is 1500ms
    const halfTtl = Math.floor(ttlMs / 2);
    // For ttlMs = 3000ms: slightlyLessThanTtl is 2500ms, ensuring it's still fresh
    const slightlyLessThanTtl = ttlMs - 500;

    // --- Expected: 1 --- (Initial Fetch)
    currentValue = await refreshed.getOrRefreshAndGet(); // Fetches 1 (fetchCounter becomes 1)
    expect(currentValue).toBe(1);
    expect(fetchFn).toHaveBeenCalledTimes(1);

    // --- Expected: 2 ---
    // Advance time by 3000ms to make current value (1) stale
    jest.advanceTimersByTime(ttlMs);
    currentValue = await refreshed.getOrRefreshAndGet(); // Fetches 2 (fetchCounter becomes 2)
    expect(currentValue).toBe(2);
    expect(fetchFn).toHaveBeenCalledTimes(2);

    // --- Expected: 3 ---
    // Advance time by 3000ms to make current value (2) stale
    jest.advanceTimersByTime(ttlMs);
    currentValue = await refreshed.getOrRefreshAndGet(); // Fetches 3 (fetchCounter becomes 3)
    expect(currentValue).toBe(3);
    expect(fetchFn).toHaveBeenCalledTimes(3);

    // --- Expected: 3 (Cached) ---
    // Advance by 1500ms. Value (3) is still fresh (1500ms < 3000ms)
    jest.advanceTimersByTime(halfTtl); // Elapsed since last fetch: 1500ms
    currentValue = await refreshed.getOrRefreshAndGet(); // Returns cached 3
    expect(currentValue).toBe(3);
    expect(fetchFn).toHaveBeenCalledTimes(3); // Not called again

    // --- Expected: 3 (Cached) ---
    // Previously advanced by 1500ms. Now advance by an additional 1000ms.
    // Total elapsed since value 3 was fetched: 1500ms + 1000ms = 2500ms.
    // This (2500ms) is less than 3000ms (ttlMs), so it's still fresh.
    jest.advanceTimersByTime(slightlyLessThanTtl - halfTtl); // Corresponds to advancing by 1000ms to reach 2500ms total elapsed
    currentValue = await refreshed.getOrRefreshAndGet(); // Returns cached 3
    expect(currentValue).toBe(3);
    expect(fetchFn).toHaveBeenCalledTimes(3); // Not called again

    // --- Expected: 4 ---
    // Value (3) was last considered fresh with 2500ms elapsed since its fetch.
    // To make it stale (reach 3000ms), advance by an additional 500ms.
    jest.advanceTimersByTime(ttlMs - slightlyLessThanTtl); // Advance by 500ms to reach 3000ms total elapsed since last fetch
    currentValue = await refreshed.getOrRefreshAndGet(); // Fetches 4 (fetchCounter becomes 4)
    expect(currentValue).toBe(4);
    expect(fetchFn).toHaveBeenCalledTimes(4);

    // --- Expected: 4 (Cached) ---
    // Advance by 1500ms (a duration clearly less than 3000ms).
    jest.advanceTimersByTime(halfTtl); // Elapsed since last fetch: 1500ms
    currentValue = await refreshed.getOrRefreshAndGet(); // Returns cached 4
    expect(currentValue).toBe(4);
    expect(fetchFn).toHaveBeenCalledTimes(4);

    // --- Expected: 5 ---
    // Value (4) was last considered fresh with 1500ms elapsed since its fetch.
    // To make it stale (reach 3000ms), advance by an additional 1500ms.
    jest.advanceTimersByTime(ttlMs - halfTtl); // Advance by 1500ms to reach 3000ms total elapsed since last fetch
    currentValue = await refreshed.getOrRefreshAndGet(); // Fetches 5 (fetchCounter becomes 5)
    expect(currentValue).toBe(5);
    expect(fetchFn).toHaveBeenCalledTimes(5);
  });
});
