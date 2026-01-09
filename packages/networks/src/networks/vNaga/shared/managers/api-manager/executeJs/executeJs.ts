/**
 * ExecuteJs API Implementation for naga-dev
 *
 * This module provides the executeJs functionality following the same pattern as pkpSign
 * but adapted for Lit Action execution with signature combination and response processing.
 *
 * Features:
 * - Handles response aggregation and signature combination
 * - Processes claims, logs, and response data
 * - Includes response strategy processing (mostCommon, leastCommon, custom)
 * - Follows the established naga-dev module pattern
 *
 * Usage:
 * This is used internally by the naga-dev module to handle executeJs responses.
 */

import { findMostCommonResponse } from '@lit-protocol/crypto';
import { NodeError } from '@lit-protocol/constants';
import { getChildLogger } from '@lit-protocol/logger';
import {
  ExecuteJsResponse,
  LitActionResponseStrategy,
} from '@lit-protocol/types';
import { z } from 'zod';
import { combineExecuteJSSignatures } from '../helper/get-signatures';
import {
  ExecuteJsValueResponse,
  LitActionClaimData,
  LitActionPaymentDetail,
} from '../types';
import { ExecuteJsResponseDataSchema } from './executeJs.ResponseDataSchema';
import { _sumPaymentDetails } from './sumPaymentDetails';

const _logger = getChildLogger({
  module: 'executeJs-api',
});

// Define ProcessedBatchResult type locally (mirroring structure from dispatchRequests)
type ProcessedBatchResult<T> =
  | { success: true; values: T[] }
  | { success: false; error: any; failedNodeUrls?: string[] };

/**
 * Find frequency of elements in an array
 * @param arr Array of elements to analyze
 * @returns Object with min (least common) and max (most common) elements
 */
const _findFrequency = <T>(arr: T[]): { min: T; max: T } => {
  const frequency: Map<string, { count: number; value: T }> = new Map();

  // Count frequencies
  for (const item of arr) {
    const key = JSON.stringify(item);
    const existing = frequency.get(key);
    if (existing) {
      existing.count++;
    } else {
      frequency.set(key, { count: 1, value: item });
    }
  }

  // Find min and max
  let minCount = Infinity;
  let maxCount = 0;
  let minValue = arr[0];
  let maxValue = arr[0];

  for (const { count, value } of Array.from(frequency.values())) {
    if (count < minCount) {
      minCount = count;
      minValue = value;
    }
    if (count > maxCount) {
      maxCount = count;
      maxValue = value;
    }
  }

  return { min: minValue, max: maxValue };
};

/**
 * Process Lit Action response strategy
 * @param responses Array of ExecuteJs responses from nodes
 * @param strategy Response strategy configuration
 * @returns Processed response based on strategy
 */
export const processLitActionResponseStrategy = (
  responses: ExecuteJsValueResponse[],
  strategy: LitActionResponseStrategy
) => {
  const executionResponses = responses.map((nodeResp) => {
    return nodeResp.response;
  });

  const copiedExecutionResponses = executionResponses.map((r) => {
    return '' + r;
  });

  if (strategy.strategy === 'custom') {
    try {
      if (strategy.customFilter) {
        const customResponseFilterResult = strategy?.customFilter(
          executionResponses as any
        );
        return customResponseFilterResult;
      } else {
        _logger.error(
          'Custom filter specified for response strategy but none found. using most common'
        );
      }
    } catch (e) {
      _logger.error(
        { error: (e as Error).toString() },
        'Error while executing custom response filter, defaulting to most common'
      );
    }
  }

  const respFrequency = _findFrequency(copiedExecutionResponses);
  if (strategy?.strategy === 'leastCommon') {
    _logger.info(
      'strategy found to be least common, taking least common response from execution results'
    );
    return respFrequency.min;
  } else if (strategy?.strategy === 'mostCommon') {
    _logger.info(
      'strategy found to be most common, taking most common response from execution results'
    );
    return respFrequency.max;
  } else {
    _logger.info(
      'no strategy found, using least common response object from execution results'
    );
    return respFrequency.min;
  }
};

/**
 * Check if an object contains signature data (r, s, v properties)
 * @param obj Object to check
 * @returns true if object contains signature properties
 */
const _isSignatureObject = (obj: any): boolean => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'r' in obj &&
    's' in obj &&
    'v' in obj
  );
};

/**
 * Extract signature data from parsed response objects
 * @param responses Array of parsed response objects
 * @returns Object containing signatures and cleaned responses
 */
const _extractSignaturesFromResponses = (
  responses: ExecuteJsValueResponse[]
): {
  hasSignatureData: boolean;
  signatureShares: Array<{ signature: any; derivedKeyId?: string }>;
  cleanedResponses: ExecuteJsValueResponse[];
} => {
  const signatureShares: Array<{ signature: any; derivedKeyId?: string }> = [];
  const cleanedResponses: ExecuteJsValueResponse[] = [];
  let hasSignatureData = false;

  for (const nodeResp of responses) {
    try {
      const parsedResponse = JSON.parse(nodeResp.response as string);

      // Check if response contains signature data
      if (parsedResponse && typeof parsedResponse === 'object') {
        // Look for direct signature object
        if (_isSignatureObject(parsedResponse)) {
          hasSignatureData = true;
          signatureShares.push({ signature: parsedResponse });
          // For direct signature objects, set response to empty or success message
          cleanedResponses.push({
            ...nodeResp,
            response: JSON.stringify({ success: true }),
          });
        }
        // Look for signature within response object (like your example)
        else if (parsedResponse.signature) {
          let signatureObj;
          try {
            // Handle case where signature is a string that needs parsing
            signatureObj =
              typeof parsedResponse.signature === 'string'
                ? JSON.parse(parsedResponse.signature)
                : parsedResponse.signature;

            if (_isSignatureObject(signatureObj)) {
              hasSignatureData = true;
              signatureShares.push({ signature: signatureObj });

              // Remove signature from response and keep the rest
              const cleanedResponse = { ...parsedResponse };
              delete cleanedResponse.signature;
              cleanedResponses.push({
                ...nodeResp,
                response: JSON.stringify(cleanedResponse),
              });
            } else {
              // Not a signature object, keep as-is
              cleanedResponses.push(nodeResp);
            }
          } catch {
            // Failed to parse signature, keep response as-is
            cleanedResponses.push(nodeResp);
          }
        } else {
          // Check for nested signature objects in response properties
          let foundSignature = false;
          const cleanedResponse = { ...parsedResponse };

          for (const [key, value] of Object.entries(parsedResponse)) {
            if (_isSignatureObject(value)) {
              hasSignatureData = true;
              foundSignature = true;
              signatureShares.push({ signature: value });
              delete cleanedResponse[key];
            }
          }

          if (foundSignature) {
            cleanedResponses.push({
              ...nodeResp,
              response: JSON.stringify(cleanedResponse),
            });
          } else {
            // No signature data found, keep as-is
            cleanedResponses.push(nodeResp);
          }
        }
      } else {
        // Not an object response, keep as-is
        cleanedResponses.push(nodeResp);
      }
    } catch {
      // Failed to parse JSON, keep original response
      cleanedResponses.push(nodeResp);
    }
  }

  return { hasSignatureData, signatureShares, cleanedResponses };
};

/**
 * Handles the response from executeJs operation
 *
 * @param result - The batch result from executing the requests
 * @param requestId - Request ID for logging
 * @param threshold - Minimum number of successful responses required
 * @param responseStrategy - Optional response strategy for processing responses
 * @returns Promise resolving to the executeJs response
 */
export const handleResponse = async (
  result: ProcessedBatchResult<z.infer<typeof ExecuteJsResponseDataSchema>>,
  requestId: string,
  threshold: number,
  responseStrategy?: LitActionResponseStrategy
): Promise<ExecuteJsResponse> => {
  _logger.info(
    {
      requestId,
      threshold,
      responseStrategy: responseStrategy?.strategy || 'default',
    },
    'executeJs:handleResponse: Processing executeJs response'
  );

  if (!result.success) {
    const rawError = 'error' in result ? result.error : 'Unknown error';
    _logger.error(
      {
        requestId,
        error: rawError,
      },
      'executeJs:handleResponse: Batch failed'
    );
    throw new NodeError(
      {
        cause: new Error('ExecuteJs batch failed'),
        info: {
          operationName: 'executeJs',
          requestId,
          rawError,
        },
      },
      `ExecuteJs batch failed for request ${requestId}: ${JSON.stringify(
        rawError
      )}`
    );
  }

  // Extract the ExecuteJsResponseDataSchema from the ProcessedBatchResult
  const executeJsResponseData = result.values[0];
  const { values } = ExecuteJsResponseDataSchema.parse(executeJsResponseData);

  _logger.info(
    {
      requestId,
      valueCount: values.length,
      successfulValues: values.filter((v) => v.success).length,
    },
    'executeJs:handleResponse: Response values received'
  );

  // Filter successful responses
  const successfulValues = values.filter((value) => value.success);

  if (successfulValues.length < threshold) {
    throw new NodeError(
      {
        cause: new Error('Insufficient successful executeJs responses'),
        info: {
          operationName: 'executeJs',
          requestId,
          threshold,
          successfulValues: successfulValues.length,
        },
      },
      `Not enough successful executeJs responses for request ${requestId}. Expected ${threshold}, got ${successfulValues.length}`
    );
  }

  // Convert to ExecuteJsValueResponse format for compatibility with old code
  const responseData: ExecuteJsValueResponse[] = successfulValues.map(
    (value) => {
      const paymentDetail: LitActionPaymentDetail[] | undefined =
        value.paymentDetail?.map((detail) => ({
          component: detail.component,
          quantity: detail.quantity,
          price: detail.price,
        }));

      return {
        nodeUrl: value.nodeUrl,
        success: value.success,
        response: value.response,
        logs: value.logs,
        signedData: value.signedData || {},
        claimData: Object.entries(value.claimData || {}).reduce(
          (acc, [key, claimData]) => {
            acc[key] = {
              signature: '', // Convert from signatures array to single signature for compatibility
              derivedKeyId: claimData.derivedKeyId || '',
            };
            return acc;
          },
          {} as Record<string, LitActionClaimData>
        ),
        decryptedData: value.decryptedData || {},
        paymentDetail,
      };
    }
  );

  // Log and expose per-node payment details
  const paymentDetailByNode = responseData
    .map((resp) => ({
      nodeUrl: resp.nodeUrl,
      paymentDetail: resp.paymentDetail,
    }))
    .filter(
      (
        entry
      ): entry is {
        nodeUrl: string;
        paymentDetail: LitActionPaymentDetail[];
      } =>
        typeof entry.nodeUrl === 'string' &&
        entry.nodeUrl.length > 0 &&
        Array.isArray(entry.paymentDetail) &&
        entry.paymentDetail.length > 0
    );

  const debug =
    paymentDetailByNode.length > 0 ? { paymentDetailByNode } : undefined;

  // Compute summed payment detail across nodes
  const summedPaymentDetail = _sumPaymentDetails(responseData);

  // Check for signature data in responses and extract if found
  const { hasSignatureData, signatureShares, cleanedResponses } =
    _extractSignaturesFromResponses(responseData);

  // Use cleaned responses for further processing if signatures were extracted
  const dataToProcess = hasSignatureData ? cleanedResponses : responseData;

  // Find most common response data using the existing function
  const mostCommonResponse = findMostCommonResponse(dataToProcess);

  // Apply response strategy processing
  const responseFromStrategy = processLitActionResponseStrategy(
    dataToProcess,
    responseStrategy ?? { strategy: 'leastCommon' }
  );
  mostCommonResponse.response = responseFromStrategy as string;

  const hasSignedData = Object.keys(mostCommonResponse.signedData).length > 0;
  const hasClaimData = Object.keys(mostCommonResponse.claimData).length > 0;
  const paymentDetail = summedPaymentDetail;

  // -- in the case where we are not signing anything on Lit action and using it as purely serverless function
  if (!hasSignedData && !hasClaimData && !hasSignatureData) {
    return {
      success: mostCommonResponse.success,
      claims: {},
      signatures: {},
      response: mostCommonResponse.response,
      logs: mostCommonResponse.logs,
      ...(paymentDetail && { paymentDetail }),
      ...(debug && { debug }),
    };
  }

  // ========== Extract shares from response data ==========

  // Combine signatures if any exist
  let signatures: Record<string, any> = {};

  if (hasSignedData) {
    _logger.info(
      {
        requestId,
      },
      'executeJs:handleResponse: Combining signatures from signedData'
    );

    signatures = await combineExecuteJSSignatures({
      nodesLitActionSignedData: dataToProcess,
      requestId,
      threshold,
    });

    _logger.info(
      {
        requestId,
        signatureKeys: Object.keys(signatures),
      },
      'executeJs:handleResponse: Signatures combined successfully'
    );
  }

  // Handle signatures extracted from response data
  if (hasSignatureData) {
    _logger.info(
      {
        requestId,
        signatureCount: signatureShares.length,
      },
      'executeJs:handleResponse: Processing signatures from response data'
    );

    // Check if these are final signatures (with r,s,v) or signature shares that need combining
    const firstSignature = signatureShares[0]?.signature;
    const isFinalSignature = _isSignatureObject(firstSignature);

    if (isFinalSignature) {
      _logger.info(
        {
          requestId,
        },
        'executeJs:handleResponse: Detected final signatures in response, using directly'
      );

      // These are final signatures, not shares - use them directly
      // Apply most common strategy to pick the signature to use
      const signatureObjects = signatureShares.map((share) => share.signature);
      const mostCommonSignature = findMostCommonResponse(
        signatureObjects.map((sig) => ({ response: JSON.stringify(sig) }))
      );

      // Convert r,s,v to the expected signature format
      const parsedSignature = JSON.parse(mostCommonSignature.response);
      const signature = {
        r: parsedSignature.r,
        s: parsedSignature.s,
        recovery: parsedSignature.v,
        v: parsedSignature.v,
        // Create full signature string if needed
        signature: `0x${parsedSignature.r}${
          parsedSignature.s
        }${parsedSignature.v.toString(16).padStart(2, '0')}`,
      };

      signatures['response_signature'] = signature;

      _logger.info(
        {
          requestId,
          signatureKeys: ['response_signature'],
        },
        'executeJs:handleResponse: Final signature processed successfully'
      );
    } else {
      _logger.info(
        {
          requestId,
          signatureCount: signatureShares.length,
        },
        'executeJs:handleResponse: Detected signature shares, combining them'
      );

      // These are signature shares that need to be combined
      // Convert signature shares to the format expected by combineExecuteJSSignatures
      const signatureResponseData: ExecuteJsValueResponse[] =
        signatureShares.map((share, index) => ({
          success: true,
          response: '',
          logs: '',
          signedData: {
            response_signature: {
              publicKey: share.derivedKeyId || '', // Use derivedKeyId as publicKey fallback
              signatureShare: JSON.stringify(share.signature),
              sigName: 'response_signature',
              sigType: 'K256' as any, // Default to K256 for ECDSA
            },
          },
          claimData: {},
          decryptedData: {},
        }));

      const responseSignatures = await combineExecuteJSSignatures({
        nodesLitActionSignedData: signatureResponseData,
        requestId,
        threshold,
      });

      // Merge with existing signatures
      signatures = { ...signatures, ...responseSignatures };

      _logger.info(
        {
          requestId,
          responseSignatureKeys: Object.keys(responseSignatures),
        },
        'executeJs:handleResponse: Signature shares combined successfully'
      );
    }
  }

  // Process claims data if present
  let claims: Record<string, { signatures: any[]; derivedKeyId: string }> = {};

  if (hasClaimData) {
    _logger.info(
      {
        requestId,
        claimKeys: Object.keys(mostCommonResponse.claimData),
      },
      'executeJs:handleResponse: Processing claims data'
    );

    // Convert claim data to expected format
    claims = Object.entries(mostCommonResponse.claimData).reduce(
      (acc, [key, claimData]) => {
        acc[key] = {
          signatures: [claimData.signature], // Convert single signature to array format
          derivedKeyId: claimData.derivedKeyId || '',
        };
        return acc;
      },
      {} as Record<string, { signatures: any[]; derivedKeyId: string }>
    );
  }

  // Try to parse response as JSON if it's a string
  let processedResponse: string | object = mostCommonResponse.response || '';

  if (typeof processedResponse === 'string' && processedResponse.trim()) {
    try {
      // Attempt to parse as JSON
      const parsed = JSON.parse(processedResponse);
      // Keep as parsed object if it's valid JSON
      processedResponse = parsed;
    } catch {
      // Keep as string if not valid JSON
      // This is expected behaviour for non-JSON responses
    }
  }

  const executeJsResponse: ExecuteJsResponse = {
    success: true,
    signatures,
    response: processedResponse,
    logs: mostCommonResponse.logs || '',
    ...(Object.keys(claims).length > 0 && { claims }),
    ...(paymentDetail && { paymentDetail }),
    ...(debug && { debug }),
  };

  _logger.info(
    {
      requestId,
      hasSignatures: Object.keys(signatures).length > 0,
      hasResponse: !!processedResponse,
      hasClaims: Object.keys(claims).length > 0,
    },
    'executeJs:handleResponse: ExecuteJs response created successfully'
  );

  return executeJsResponse;
};
