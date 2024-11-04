import { ConditionalRetry, RetryError, TimeoutError, RetryCondition } from './';

describe('ConditionalRetry', () => {
  const successfulOperation = jest.fn(async () => 'Success');
  const failingOperation = jest.fn(async () => {
    throw new Error('Test failure');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return the result of a successful operation without retries', async () => {
    const retry = new ConditionalRetry({
      operation: successfulOperation,
      globalMaxRetries: 3,
      timeoutSeconds: 5,
    });

    const result = await retry.start();
    expect(result).toBe('Success');
    expect(successfulOperation).toHaveBeenCalledTimes(1);
  });

  test('should retry on failure and eventually succeed', async () => {
    const operation = jest
      .fn()
      .mockRejectedValueOnce(new Error('Temporary error'))
      .mockResolvedValueOnce('Success');

    const retry = new ConditionalRetry({
      operation,
      globalMaxRetries: 3,
      timeoutSeconds: 5,
    });

    const result = await retry.start();
    expect(result).toBe('Success');
    expect(operation).toHaveBeenCalledTimes(2); // 1 failure + 1 success
  });

  test('should retry based on condition and fail after condition max retries', async () => {
    const condition: RetryCondition = {
      maxRetries: 2,
      attempts: 1,
      backoffType: 'fixed',
      baseDelay: 100,
      shouldRetry: (error) => error.message === 'Condition failure',
    };

    const retry = new ConditionalRetry({
      operation: failingOperation,
      globalMaxRetries: 5,
      timeoutSeconds: 5,
      conditions: [condition],
    });

    await expect(retry.start()).rejects.toThrow(RetryError);
    expect(failingOperation).toHaveBeenCalledTimes(5); // 1 initial attempt + 2 retries from condition + 2 more from globalMaxRetries
  });

  test('should retry up to global max retries if no condition matches', async () => {
    const retry = new ConditionalRetry({
      operation: failingOperation,
      globalMaxRetries: 3,
      timeoutSeconds: 5,
    });

    await expect(retry.start()).rejects.toThrow(RetryError);
    expect(failingOperation).toHaveBeenCalledTimes(3); // Retry up to globalMaxRetries
  });

  test('should honor global max retries even if a condition exists but is not matched', async () => {
    const condition: RetryCondition = {
      maxRetries: 2,
      attempts: 1,
      backoffType: 'fixed',
      baseDelay: 100,
      shouldRetry: (error) => error.message === 'Non-matching error',
    };

    const retry = new ConditionalRetry({
      operation: failingOperation,
      globalMaxRetries: 3,
      timeoutSeconds: 5,
      conditions: [condition],
    });

    await expect(retry.start()).rejects.toThrow(RetryError);
    expect(failingOperation).toHaveBeenCalledTimes(3); // Retries up to the global max
  });

  test('should timeout if the operation does not complete within the specified time', async () => {
    const longOperation = jest.fn(
      () => new Promise((resolve, reject) => setTimeout(reject, 3000))
    );

    const retry = new ConditionalRetry({
      operation: longOperation,
      globalMaxRetries: 3,
      timeoutSeconds: 2,
    });

    await expect(retry.start()).rejects.toThrow(TimeoutError);
    expect(longOperation).toHaveBeenCalledTimes(1); // Only one attempt due to timeout
  });
});
