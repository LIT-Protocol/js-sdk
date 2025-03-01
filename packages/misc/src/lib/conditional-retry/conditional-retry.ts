import { RetryError } from './retry-error';
import { TimeoutError } from './timeout-error';

import type {
  BackoffParams,
  ConditionalRetryConfig,
  OnRetryParams,
  Operation,
  RetryCondition,
} from './types';

/**
 * A configurable retry handler that attempts an operation based on global and condition-specific retry settings.
 * Supports different backoff strategies for each condition and a global configuration if no conditions are provided.
 *
 * @template T The type of result returned by the operation.
 */
export class ConditionalRetry<T> {
  private operation: Operation<T>;
  private globalMaxRetries: number;
  private timeoutMs: number; // Timeout in milliseconds, converted from seconds
  private conditions: RetryCondition[];
  private globalAttempts: number = 1; // Start global attempts at 1
  private baseDelay: number; // Default base delay in ms for backoff
  private maxDelay: number; // Default max delay in ms for backoff
  private errors: Error[] = []; // Stores errors from each retry attempt

  /**
   * Creates a new instance of `ConditionalRetry`.
   *
   * @param {ConditionalRetryConfig<T>} config - The configuration for the retry logic.
   * @param {Operation<T>} config.operation - The asynchronous operation to execute with retries.
   * @param {number} config.globalMaxRetries - The maximum number of retry attempts globally.
   * @param {number} config.timeoutSeconds - The maximum duration in seconds to attempt retries.
   * @param {RetryCondition[]} [config.conditions=[]] - Optional array of retry conditions with specific rules and backoff strategies.
   * @param {number} [config.baseDelay=100] - The default base delay in milliseconds for retries.
   * @param {number} [config.maxDelay=2000] - The maximum delay in milliseconds for retries.
   *
   * @example
   * // Example with global configuration only
   * const conditionalRetry = new ConditionalRetry<string>({
   *   operation: async () => {
   *     // Simulate a network request
   *     throw new Error("Network error");
   *   },
   *   globalMaxRetries: 5,
   *   timeoutSeconds: 10, // 10 seconds
   *   baseDelay: 100,
   *   maxDelay: 2000
   * });
   *
   * conditionalRetry.start()
   *   .then(result => console.log("Data fetched:", result))
   *   .catch(error => {
   *     if (error instanceof RetryError) {
   *       console.error("Failed to fetch data. Reasons:", error.reasons);
   *     } else {
   *       console.error("Failed to fetch data:", error);
   *     }
   *   });
   */
  constructor({
    operation,
    globalMaxRetries,
    timeoutSeconds,
    conditions = [], // Default to an empty array if no conditions are provided
    baseDelay = 100,
    maxDelay = 2000,
  }: ConditionalRetryConfig<T>) {
    this.operation = operation;
    this.globalMaxRetries = globalMaxRetries;
    this.timeoutMs = timeoutSeconds * 1000; // Convert seconds to milliseconds
    this.baseDelay = baseDelay;
    this.maxDelay = maxDelay;
    this.conditions = conditions.map((cond) => ({ ...cond, attempts: 1 })); // Start attempts at 1 for each condition
  }

  /**
   * Starts the retry operation with the provided global and condition-specific configurations.
   *
   * @returns {ReturnType<Operation<T>>} The result of the operation if successful.
   * @throws {RetryError | TimeoutError} If the operation fails after the specified retries or times out.
   */
  async start(): ReturnType<Operation<T>> {
    this.globalAttempts = 1; // Start globalAttempts at 1 for first execution
    this.errors = []; // Reset errors array before execution starts
    const startTime = Date.now();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const elapsed = Date.now() - startTime;
      if (elapsed >= this.timeoutMs) {
        throw new TimeoutError(
          `Operation timed out after ${elapsed / 1000} seconds`,
          this.errors
        );
      }

      try {
        return await this.operation();
      } catch (error: unknown) {
        this.errors.push(error as Error); // Track each error encountered

        // Define global config object
        const globalConfig = {
          maxRetries: this.globalMaxRetries,
          timeoutSeconds: this.timeoutMs / 1000,
        };

        // Try to find a matching retry condition
        const condition: RetryCondition | undefined = this.conditions.find(
          (cond) => {
            const retryParams: OnRetryParams = {
              globalAttemptNum: this.globalAttempts,
              conditionAttemptNum: cond.attempts,
              globalConfig,
              previousErrors: [...this.errors], // Pass all previous errors
            };

            // Call shouldRetry with the error and retryParams
            return cond.shouldRetry(error as Error, retryParams);
          }
        );

        // Determine the max retries to use based on whether a condition was matched
        const maxRetries = condition
          ? condition.maxRetries
          : this.globalMaxRetries;
        const attempts = condition ? condition.attempts : this.globalAttempts;

        // Check if retries have been exhausted
        if (attempts >= maxRetries) {
          throw new RetryError(
            `Failed after ${attempts} attempts${
              condition ? ' for condition' : ''
            }: ${(error as Error).message}`,
            this.errors
          );
        }

        console.log(
          `Global attempts: ${this.globalAttempts}, Condition attempts: ${attempts}`
        );

        // Determine backoff delay based on the selected backoff type, using either condition-specific or class-level delay values
        const delay = this.calculateBackoffDelay({
          attempt: this.globalAttempts,
          backoffType: condition ? condition.backoffType : 'fullJitter',
          baseDelay: condition?.baseDelay ?? this.baseDelay,
          maxDelay: condition?.maxDelay ?? this.maxDelay,
        });

        // Increment global and condition attempts after each retry
        this.globalAttempts += 1;
        if (condition) {
          condition.attempts += 1;
        }

        await this.sleep(delay);
      }
    }
  }

  /**
   * Calculates the backoff delay for the next retry attempt based on the provided parameters.
   *
   * @param {BackoffParams} params - Parameters to calculate the backoff delay.
   * @param {number} params.attempt - The current attempt number.
   * @param {BackoffType} params.backoffType - The backoff strategy to use.
   * @param {number} params.baseDelay - The base delay in milliseconds.
   * @param {number} params.maxDelay - The maximum allowable delay in milliseconds.
   * @returns {number} The calculated delay in milliseconds.
   */
  private calculateBackoffDelay({
    attempt,
    backoffType,
    baseDelay,
    maxDelay,
  }: BackoffParams): number {
    const exponentialBackoff = Math.min(baseDelay * 2 ** attempt, maxDelay);

    switch (backoffType) {
      case 'exponential':
        return exponentialBackoff;
      case 'fixed':
        return baseDelay;
      case 'linear':
        return Math.min(baseDelay * attempt, maxDelay);
      case 'fullJitter':
      default:
        return Math.random() * exponentialBackoff;
    }
  }

  /**
   * Delays execution for the specified number of milliseconds.
   *
   * @param {number} ms - The duration to delay in milliseconds.
   * @returns {Promise<void>} A promise that resolves after the delay.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
