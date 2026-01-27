import * as LitNodeApi from '../../LitNodeClient/LitNodeApi';
import { RequestItem } from '@lit-protocol/types';
import { getChildLogger } from '@lit-protocol/logger';

const _logger = getChildLogger({
  module: 'handleNodePromises',
});

/**
 * @fileOverview
 * This file provides utility functions to process a batch of asynchronous requests
 * to Lit Protocol nodes in a functional style. It aggregates results from multiple
 * promises and determines overall success based on a minimum number of successful outcomes.
 */

//------------------------------------------------------------------------------------
// Type Definitions
//------------------------------------------------------------------------------------

/**
 * Represents the structure of the 'authSig' object within a request's data.
 * This is typically a session signature for a specific node.
 */
export interface RequestAuthSig {
  sig: string;
  derivedVia: string; // e.g., "litSessionSignViaNacl"
  signedMessage: string; // JSON string
  address: string; // Public key of the session key
  algo: string; // e.g., "ed25519"
}

/**
 * Represents an item in the 'nodeSet' array within a request's data.
 */
export interface NodeSetEntry {
  socketAddress: string; // e.g., "148.113.162.28:7470"
  value: number; // Typically 1
}

/**
 * Represents a successful outcome from processing the batch of requests.
 * @template T The type of the value returned by a successful individual request.
 */

export interface BatchSuccessResult<T> {
  success: true;
  values: T[];
}

/**
 * Represents a failed outcome from processing the batch of requests.
 * The 'error' property can be any type, but structured error objects are recommended.
 */
export interface BatchErrorResult {
  success: false;
  error: any;
}

/**
 * Union type for the result of processing the batch of requests.
 * @template T The type of the value returned by a successful individual request.
 */
export type ProcessedBatchResult<T> = BatchSuccessResult<T> | BatchErrorResult;

/**
 * Placeholder type for the expected successful response from a node for a signing operation.
 * This should be refined based on the actual response structure of `LitNodeApi.sendNodeRequest`
 * for PKP signing.
 */
export interface NodeResponse {
  // Example fields - adjust based on actual node response
  signatureShare?: string;
  signature?: string;
  dataSigned?: string;
  rawPubKey?: string;
  // Potentially other fields like status, etc.
  [key: string]: any; // Allow other properties
}

function isErrorResponse(value: unknown): value is { success: false; error?: any } {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'success' in (value as Record<string, unknown>) &&
      (value as { success?: boolean }).success === false
  );
}

function summarizeError(error: unknown): Record<string, unknown> {
  if (!error || typeof error !== 'object') {
    return { message: String(error) };
  }

  const err = error as Record<string, unknown>;
  const rawError = err['error'];
  const safeError =
    rawError === null ||
    typeof rawError === 'string' ||
    typeof rawError === 'number' ||
    typeof rawError === 'boolean'
      ? rawError
      : undefined;
  return {
    name: typeof err['name'] === 'string' ? err['name'] : undefined,
    message: typeof err['message'] === 'string' ? err['message'] : String(err),
    code: err['code'],
    shortMessage: err['shortMessage'],
    status: err['status'],
    error: safeError,
    errorObject: err['errorObject'],
    details: err['details'],
  };
}

//------------------------------------------------------------------------------------
// Core Logic
//------------------------------------------------------------------------------------

/**
 * Executes a single asynchronous request to a Lit Protocol node.
 * This function wraps `LitNodeApi.sendNodeRequest`.
 *
 * @template T The expected type of the data in a successful response (defaults to `NodeResponse`).
 * @param requestItem The `RequestItem` object to be processed.
 * @returns A Promise that resolves with the response data or rejects with an error.
 */
async function executeSingleRequest<M, T = NodeResponse>(
  requestItem: RequestItem<M>
): Promise<T> {
  // The linter indicates sendNodeRequest expects an object matching RequestItem's structure (with fullPath).
  return LitNodeApi.sendNodeRequest(requestItem) as Promise<T>;
}

/**
 * Finds the most common error from a list of error objects.
 *
 * @param errors An array of error objects.
 * @returns The most common error object found in the array, or the first error if all are unique or if no single most common error. Returns `null` if the input array is empty.
 */
function getMostCommonError(errors: any[]): any {
  if (!errors || errors.length === 0) {
    return null;
  }
  if (errors.length === 1) {
    return errors[0];
  }

  const errorCounts: Record<string, { count: number; error: any }> = {};
  let maxCount = 0;
  let mostCommonErrorItem: any = errors[0]; // Default to the first error

  errors.forEach((err) => {
    const errKey = JSON.stringify(err); // Using JSON.stringify to key errors
    if (errorCounts[errKey]) {
      errorCounts[errKey].count++;
    } else {
      errorCounts[errKey] = { count: 1, error: err };
    }

    if (errorCounts[errKey].count > maxCount) {
      maxCount = errorCounts[errKey].count;
      mostCommonErrorItem = errorCounts[errKey].error;
    }
  });

  return mostCommonErrorItem;
}

/**
 * Processes a batch of request items asynchronously and aggregates their results.
 * It implements an "early success" mechanism: if `minSuccessCount` successful responses
 * are received, it resolves immediately without waiting for all other requests to complete.
 *
 * @template M The type of the data payload within each `RequestItem`.
 * @template T The expected type of a successful response from a single request (defaults to `NodeResponse`).
 * @param requests An array of `RequestItem` objects to be processed.
 * @param batchRequestId A unique identifier for this batch of requests.
 * @param minSuccessCount The minimum number of successful responses required for the batch to be considered successful.
 * @returns A Promise that resolves to a `ProcessedBatchResult<T>`, indicating either overall success with the collected values or failure with an error.
 */
export async function dispatchRequests<T, M = NodeResponse>(
  requests: RequestItem<T>[],
  batchRequestId: string,
  minSuccessCount: number
): Promise<ProcessedBatchResult<M>> {
  if (!Array.isArray(requests)) {
    return {
      success: false,
      error: {
        name: 'InvalidInputError',
        message: 'The "requests" parameter must be an array.',
        details: { batchRequestId },
      },
    };
  }

  /**
   * Waits for N successes from a list of promises, or until all promises settle.
   * Resolves early if N successes are achieved.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function waitForNSuccessesWithErrorsHelper<LocalT>(
    promises: Promise<LocalT>[],
    n: number
  ): Promise<{ successes: LocalT[]; errors: any[] }> {
    let responses = 0;
    const successes: LocalT[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors: any[] = [];
    let resolved = false;

    return new Promise((resolveOuter) => {
      if (n === 0) {
        resolveOuter({ successes: [], errors: [] });
        return;
      }

      if (promises.length === 0 && n > 0) {
        // Cannot achieve n successes if there are no promises and n > 0.
        resolveOuter({ successes: [], errors: [] });
        return;
      }

      // If promises.length is 0 and n is 0, it's handled by the n === 0 case.
      // If promises.length > 0 but less than n (e.g. 2 promises, n=3),
      // it will naturally fall through to the `responses === promises.length`
      // case, collecting all available successes and errors.

      promises.forEach((promise) => {
        promise
          .then((result) => {
            if (resolved) return; // Already resolved, ignore further results for this path
            successes.push(result);
            if (successes.length >= n) {
              resolved = true;
              resolveOuter({ successes, errors }); // errors array contains errors encountered so far
            }
          })
          .catch((error) => {
            if (resolved) return; // Already resolved, ignore further errors for this path
            errors.push(error);
            // No early exit on errors alone, wait for other promises or all to settle.
          })
          .finally(() => {
            if (resolved) return; // Already resolved

            responses++;
            if (responses === promises.length) {
              // All promises have settled, and we haven't resolved yet
              // (which means successes.length < n)
              resolved = true;
              resolveOuter({ successes, errors });
            }
          });
      });
    });
  }

  if (requests.length === 0) {
    if (minSuccessCount === 0) {
      return { success: true, values: [] };
    }
    return {
      success: false,
      error: {
        name: 'InvalidInputError',
        message: 'Request array is empty, but minSuccessCount > 0.',
        details: { batchRequestId, minSuccessCount },
      },
    };
  }

  const nodeErrors: {
    nodeUrl: string;
    fullPath: string;
    error: Record<string, unknown>;
  }[] = [];

  const nodePromises = requests.map((req) =>
    executeSingleRequest<T, M>(req)
      .then((result) => {
        if (isErrorResponse(result)) {
          throw result;
        }
        return result;
      })
      .catch((error) => {
        let nodeUrl = req.fullPath;
        try {
          nodeUrl = new URL(req.fullPath).host;
        } catch {
          // fall back to fullPath if it isn't a valid URL
        }
      nodeErrors.push({
        nodeUrl,
        fullPath: req.fullPath,
        error: summarizeError(error),
      });
        throw error;
      })
  );

  const { successes, errors: failures } =
    await waitForNSuccessesWithErrorsHelper<M>(nodePromises, minSuccessCount);

  if (successes.length >= minSuccessCount) {
    return {
      success: true,
      values: successes, // Contains at least minSuccessCount items
    };
  }

  // If we are here, successes.length < minSuccessCount
  if (failures.length === 0) {
    // Not enough successes, but no explicit errors were caught by promises.
    // This means all promises settled successfully, but the total count was less than minSuccessCount.
    return {
      success: false,
      error: {
        name: 'InsufficientSuccessNoError',
        message: `Batch ${batchRequestId}: Not enough successful responses (${successes.length}) from ${nodePromises.length} attempts, and no errors were reported. Minimum required: ${minSuccessCount}.`,
        details: {
          batchRequestId,
          successCount: successes.length,
          failureCount: failures.length, // This will be 0
          minSuccessCount,
          totalRequests: nodePromises.length,
        },
      },
    };
  }

  // Not enough successes, and there were failures.
  const mostCommonError = getMostCommonError(failures);

  if (nodeErrors.length > 0) {
    _logger.warn(
      {
        batchRequestId,
        nodeErrors,
      },
      'dispatchRequests: node failures'
    );
  }

  if (mostCommonError && typeof mostCommonError === 'object') {
    try {
      (mostCommonError as { __nodeErrors?: unknown }).__nodeErrors = nodeErrors;
    } catch {
      // ignore if we cannot attach metadata
    }
  }

  return {
    success: false,
    error: mostCommonError, // This will be one of the error objects from the failures array
  };
}
