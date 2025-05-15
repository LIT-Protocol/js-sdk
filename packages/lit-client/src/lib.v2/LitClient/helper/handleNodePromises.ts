import * as LitNodeApi from '@lit-protocol/lit-node-client';

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
 * Interface for the 'data' payload of a single request item sent to a node.
 * This should align with the expected schema for endpoints like PKP_SIGN.
 */
export interface RequestItemData {
  toSign: number[] | Uint8Array;
  signingScheme: string; // e.g., "EcdsaK256Sha256"
  pubkey: string; // The public key for which the signature is requested
  authSig: RequestAuthSig;
  nodeSet: NodeSetEntry[];
  // Add any other fields that might be part of the request data.
}

/**
 * Interface for a single request item to be sent to a Lit Protocol node.
 * This structure should match the objects within the '_request' array in getLitClient.ts.
 */
export interface RequestItem {
  fullPath: string; // The full URL endpoint of the node
  data: RequestItemData; // The payload for the request
  requestId: string; // Identifier for this specific request/batch
  epoch: number; // The current epoch number
  version: string; // The version of the Lit Protocol client/network
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
export interface NodeSignResponse {
  // Example fields - adjust based on actual node response
  signatureShare?: string;
  signature?: string;
  dataSigned?: string;
  rawPubKey?: string;
  // Potentially other fields like status, etc.
  [key: string]: any; // Allow other properties
}

//------------------------------------------------------------------------------------
// Core Logic
//------------------------------------------------------------------------------------

/**
 * Executes a single asynchronous request to a Lit Protocol node.
 * This function wraps `LitNodeApi.sendNodeRequest`.
 *
 * @template T The expected type of the data in a successful response (defaults to `NodeSignResponse`).
 * @param requestItem The `RequestItem` object to be processed.
 * @returns A Promise that resolves with the response data or rejects with an error.
 */
async function executeSingleRequest<T = NodeSignResponse>(
  requestItem: RequestItem
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
 *
 * @template T The expected type of a successful response from a single request (defaults to `NodeSignResponse`).
 * @param requests An array of `RequestItem` objects to be processed.
 * @param batchRequestId A unique identifier for this batch of requests.
 * @param minSuccessCount The minimum number of successful responses required for the batch to be considered successful.
 * @returns A Promise that resolves to a `ProcessedBatchResult<T>`, indicating either overall success with the collected values or failure with an error.
 */
export async function processBatchRequests<T = NodeSignResponse>(
  requests: RequestItem[],
  batchRequestId: string,
  minSuccessCount: number
): Promise<ProcessedBatchResult<T>> {
  if (!Array.isArray(requests)) {
    return {
        success: false,
        error: {
            name: 'InvalidInputError',
            message: 'The "requests" parameter must be an array.',
            details: { batchRequestId }
        }
    };
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
            details: { batchRequestId, minSuccessCount }
        }
    };
  }

  const nodePromises = requests.map((req) => executeSingleRequest<T>(req));
  const settledResults = await Promise.allSettled(nodePromises);

  const successes: T[] = [];
  const failures: any[] = [];

  settledResults.forEach((result) => {
    if (result.status === 'fulfilled') {
      successes.push(result.value);
    } else {
      failures.push(result.reason);
    }
  });

  if (successes.length >= minSuccessCount) {
    return {
      success: true,
      values: successes,
    };
  }

  if (failures.length === 0) {
    // Not enough successes, but no explicit errors were thrown by promises.
    return {
      success: false,
      error: {
        name: 'InsufficientSuccessNoError',
        message: `Batch ${batchRequestId}: Not enough successful responses (${successes.length}) from ${requests.length} attempts, and no errors were reported. Minimum required: ${minSuccessCount}.`,
        details: {
          batchRequestId,
          successCount: successes.length,
          failureCount: failures.length,
          minSuccessCount,
          totalRequests: nodePromises.length,
        },
      },
    };
  }

  const mostCommonError = getMostCommonError(failures);

  return {
    success: false,
    error: mostCommonError,
  };
}
