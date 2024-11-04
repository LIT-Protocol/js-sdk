export type BackoffType = 'fullJitter' | 'exponential' | 'fixed' | 'linear';

/**
 * Defines a retry condition with specific retry logic, backoff strategy, and limits.
 */
export interface RetryCondition {
  /**
   * The maximum number of retry attempts for this specific condition.
   */
  maxRetries: number;

  /**
   * Tracks the number of attempts made under this condition.
   */
  attempts: number;

  /**
   * The type of backoff strategy to use for this condition.
   * Options include:
   * - "fullJitter": Exponential backoff with a random jitter.
   * - "exponential": Exponential backoff without jitter.
   * - "fixed": A fixed delay between retries.
   * - "linear": A linearly increasing delay.
   */
  backoffType: BackoffType;

  /**
   * The base delay in milliseconds for retries under this condition.
   * Optional: If not provided, the global base delay will be used.
   */
  baseDelay?: number;

  /**
   * The maximum allowable delay in milliseconds for retries under this condition.
   * Optional: If not provided, the global max delay will be used.
   */
  maxDelay?: number;

  /**
   * Determines if the retry should proceed based on the current error and retry parameters.
   *
   * @param {Error} error - The error encountered during the last attempt.
   * @param {OnRetryParams} retryParams - Parameters for the current retry attempt.
   * @returns {boolean} - True if the operation should be retried, false otherwise.
   */
  shouldRetry: (error: Error, retryParams: OnRetryParams) => boolean;
}

export interface OnRetryParams {
  globalAttemptNum: number; // Global attempt count
  conditionAttemptNum: number; // Condition-specific attempt count
  globalConfig: { maxRetries: number; timeoutSeconds: number };
  previousErrors: Error[]; // Array of previously encountered errors
}

export interface BackoffParams {
  attempt: number;
  backoffType: BackoffType;
  baseDelay: number;
  maxDelay: number;
}

export type Operation<T> = () => Promise<T>;

export interface ConditionalRetryConfig<T> {
  operation: Operation<T>;
  globalMaxRetries: number;
  timeoutSeconds: number;
  conditions?: RetryCondition[]; // Optional conditions
  baseDelay?: number;
  maxDelay?: number;
}
