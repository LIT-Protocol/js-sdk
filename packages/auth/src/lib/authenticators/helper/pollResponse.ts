/**
 * @file pollResponse.ts
 * @description A generic helper function to poll an endpoint until a specific condition is met or an error occurs.
 *
 * Usage:
 * ```typescript
 * import { pollResponse } from './pollResponse';
 *
 * interface MyJobStatus {
 *   id: string;
 *   status: 'pending' | 'processing' | 'finished' | 'error';
 *   result?: any;
 *   errorMessage?: string;
 * }
 *
 * async function checkJob(jobId: string): Promise<MyJobStatus> {
 *   const url = `https://api.example.com/jobs/${jobId}`;
 *
 *   try {
 *     const finalStatus = await pollResponse<MyJobStatus>({
 *       url,
 *       isCompleteCondition: (response) => response.status === 'finished',
 *       isErrorCondition: (response) => response.status === 'error',
 *       intervalMs: 2000, // Poll every 2 seconds
 *       maxRetries: 30,    // Try up to 30 times (1 minute total)
 *       errorMessageContext: `Job ${jobId}` // For clearer error messages
 *     });
 *     console.log('Job finished successfully:', finalStatus.result);
 *     return finalStatus;
 *   } catch (error) {
 *     console.error('Failed to get job status:', error);
 *     throw error;
 *   }
 * }
 * ```
 */

/**
 * Defines the parameters for the pollResponse function.
 * @template TResponse The expected type of the JSON response from the URL.
 */
export interface PollResponseParams<TResponse> {
  /** The URL to poll. */
  url: string;
  /**
   * A callback function that takes the response data and returns `true` if the polling
   * should be considered complete, `false` otherwise.
   * @param response The JSON response from the URL.
   * @returns `true` if the condition for completion is met, `false` otherwise.
   */
  isCompleteCondition: (response: TResponse) => boolean;
  /**
   * (Optional) A callback function that takes the response data and returns `true`
   * if the job/process has definitively failed or encountered an unrecoverable error.
   * If this condition is met, polling will stop immediately and the promise will be rejected.
   * @param response The JSON response from the URL.
   * @returns `true` if an error condition is met, `false` otherwise.
   */
  isErrorCondition?: (response: TResponse) => boolean;
  /** The interval in milliseconds between polling attempts. Defaults to 1000ms (1 second). */
  intervalMs?: number;
  /** The maximum number of polling attempts. Defaults to 60. */
  maxRetries?: number;
  /** (Optional) A string to provide context in error messages (e.g., "Job ID X", "Process Y"). */
  errorMessageContext?: string;
}

/**
 * Polls an endpoint until a specific condition is met, an error condition is met, or the maximum retries are exhausted.
 * @template TResponse The expected type of the JSON response from the URL.
 * @param params Parameters for polling, including the URL, completion condition, and retry logic.
 * @returns A promise that resolves with the successful response data when the completion condition is met.
 * @throws An error if the error condition is met, polling times out, a network error occurs, or the response is not valid JSON.
 */
export async function pollResponse<TResponse>({
  url,
  isCompleteCondition,
  isErrorCondition,
  intervalMs = 1000,
  maxRetries = 60,
  errorMessageContext = 'Polling',
}: PollResponseParams<TResponse>): Promise<TResponse> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(
        `${errorMessageContext}: Polling attempt ${
          i + 1
        }/${maxRetries} for ${url}`
      );
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            `${errorMessageContext}: Resource not found at ${url} (404). It might have expired, been processed, or the ID/URL is invalid.`
          );
        }
        // Log other non-ok statuses but continue retrying unless it's a client error type that won't resolve on its own.
        console.error(
          `${errorMessageContext}: Polling attempt ${
            i + 1
          } failed with HTTP status: ${
            response.status
          } for URL ${url}. Retrying...`
        );
        // Optionally, specific handling for other critical HTTP errors could be added here to throw immediately.
      } else {
        const data = (await response.json()) as TResponse;
        console.log(
          `${errorMessageContext}: Polling attempt ${
            i + 1
          }/${maxRetries} - current status/data:`,
          data
        );

        if (isErrorCondition?.(data)) {
          console.error(
            `${errorMessageContext}: Error condition met during polling.`,
            data
          );
          // Attempt to get more specific error details if available
          const errorDetails =
            (data as any)?.error ||
            (data as any)?.message ||
            (data as any)?.returnValue;
          throw new Error(
            `${errorMessageContext} failed. Error condition met. Details: ${
              errorDetails
                ? JSON.stringify(errorDetails)
                : 'No specific error details in response.'
            }`
          );
        }

        if (isCompleteCondition(data)) {
          console.log(
            `${errorMessageContext}: Completion condition met successfully.`,
            data
          );
          return data;
        }
        // If neither error nor complete, continue polling after delay.
      }
    } catch (error: any) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `${errorMessageContext}: Error during polling attempt ${
          i + 1
        }/${maxRetries} for ${url}:`,
        message
      );
      // If it's the last attempt, or a critical error (like 404 or an explicit error condition from isErrorCondition), rethrow.
      if (
        i === maxRetries - 1 ||
        message.includes('Resource not found') || // From 404
        message.includes('Error condition met') // From isErrorCondition
      ) {
        throw new Error(
          `${errorMessageContext}: Failed to achieve completion at ${url} after ${
            i + 1
          } attempts. Last error: ${message}`
        );
      }
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(
    `${errorMessageContext}: Did not complete at ${url} after ${maxRetries} retries and ${
      (maxRetries * intervalMs) / 1000
    } seconds.`
  );
}
