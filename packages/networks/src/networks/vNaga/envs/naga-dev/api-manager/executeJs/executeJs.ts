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
import { getChildLogger } from '@lit-protocol/logger';
import { ExecuteJsResponse, LitActionResponseStrategy } from '@lit-protocol/types';
import { z } from 'zod';
import { combineExecuteJSSignatures } from '../helper/get-signatures';
import { ExecuteJsResponseDataSchema } from './executeJs.ResponseDataSchema';
import { ExecuteJsValueResponse, LitActionClaimData } from '../types';

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
  
  for (const { count, value } of frequency.values()) {
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
        const customResponseFilterResult =
          strategy?.customFilter(executionResponses as any);
        return customResponseFilterResult;
      } else {
        _logger.error(
          'Custom filter specified for response strategy but none found. using most common'
        );
      }
    } catch (e) {
      _logger.error(
        'Error while executing custom response filter, defaulting to most common',
        (e as Error).toString()
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
  _logger.info('executeJs:handleResponse: Processing executeJs response', {
    requestId,
    threshold,
    responseStrategy: responseStrategy?.strategy || 'default',
  });

  if (!result.success) {
    _logger.error('executeJs:handleResponse: Batch failed', {
      requestId,
      error: result.error,
    });
    throw new Error(`ExecuteJs batch failed: ${JSON.stringify(result.error)}`);
  }

  const { values } = ExecuteJsResponseDataSchema.parse(result);

  _logger.info('executeJs:handleResponse: Response values received', {
    requestId,
    valueCount: values.length,
    successfulValues: values.filter((v) => v.success).length,
  });

  // Filter successful responses
  const successfulValues = values.filter((value) => value.success);

  if (successfulValues.length < threshold) {
    throw new Error(
      `Not enough successful executeJs responses. Expected ${threshold}, got ${successfulValues.length}`
    );
  }

  // Convert to ExecuteJsValueResponse format for compatibility with old code
  const responseData: ExecuteJsValueResponse[] = successfulValues.map((value) => ({
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
  }));

  // Find most common response data using the existing function
  const mostCommonResponse = findMostCommonResponse(responseData);

  // Apply response strategy processing
  const responseFromStrategy = processLitActionResponseStrategy(
    responseData,
    responseStrategy ?? { strategy: 'leastCommon' }
  );
  mostCommonResponse.response = responseFromStrategy as string;

  const hasSignedData = Object.keys(mostCommonResponse.signedData).length > 0;
  const hasClaimData = Object.keys(mostCommonResponse.claimData).length > 0;

  // -- in the case where we are not signing anything on Lit action and using it as purely serverless function
  if (!hasSignedData && !hasClaimData) {
    return {
      success: mostCommonResponse.success,
      claims: {},
      signatures: {},
      response: mostCommonResponse.response,
      logs: mostCommonResponse.logs,
    };
  }

  // ========== Extract shares from response data ==========

  // Combine signatures if any exist
  let signatures: Record<string, any> = {};

  if (hasSignedData) {
    _logger.info('executeJs:handleResponse: Combining signatures', {
      requestId,
    });

    signatures = await combineExecuteJSSignatures({
      nodesLitActionSignedData: responseData,
      requestId,
      threshold,
    });

    _logger.info('executeJs:handleResponse: Signatures combined successfully', {
      requestId,
      signatureKeys: Object.keys(signatures),
    });
  }

  // Process claims data if present
  let claims: Record<string, { signatures: any[]; derivedKeyId: string }> = {};

  if (hasClaimData) {
    _logger.info('executeJs:handleResponse: Processing claims data', {
      requestId,
      claimKeys: Object.keys(mostCommonResponse.claimData),
    });

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
  };

  _logger.info(
    'executeJs:handleResponse: ExecuteJs response created successfully',
    {
      requestId,
      hasSignatures: Object.keys(signatures).length > 0,
      hasResponse: !!processedResponse,
      hasClaims: Object.keys(claims).length > 0,
    }
  );

  return executeJsResponse;
};
