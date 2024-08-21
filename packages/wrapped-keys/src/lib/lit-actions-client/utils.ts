import { ExecuteJsResponse, JsonExecutionSdkParams } from '@lit-protocol/types';

import { LIT_ACTION_CID_REPOSITORY } from './constants';
import { LitActionType } from './types';
import { Network } from '../types';
import { WRAPPED_KEY_FALLBACK_SERVICE } from '@lit-protocol/constants';

/**
 *
 * Post processes the Lit Action result to ensure that the result is non-empty and a valid string
 *
 * @param result - The Lit Action result to be processes
 *
 * @returns { string } - The response field in the Lit Action result object
 */
export function postLitActionValidation(
  result: ExecuteJsResponse | undefined
): string {
  if (!result) {
    throw new Error('There was an unknown error running the Lit Action.');
  }

  const { response } = result;
  if (!response) {
    throw new Error(
      `Expected "response" in Lit Action result: ${JSON.stringify(result)}`
    );
  }

  if (typeof response !== 'string') {
    // As the return value is a hex string
    throw new Error(
      `Lit Action should return a string response: ${JSON.stringify(result)}`
    );
  }

  if (!result.success) {
    throw new Error(`Expected "success" in res: ${JSON.stringify(result)}`);
  }

  if (response.startsWith('Error:')) {
    // Lit Action sets an error response
    throw new Error(`Error executing the Signing Lit Action: ${response}`);
  }

  return response;
}

export function getLitActionCid(network: Network, actionType: LitActionType) {
  return LIT_ACTION_CID_REPOSITORY[actionType][network];
}

/**
 * Fetches and updates the params.code if it matches the given IPFS ID, and
 * set the IPFS ID to undefined.
 *
 * @param params - The JSON execution SDK parameters.
 * @returns A promise that resolves to the updated JSON execution SDK parameters.
 * @throws If there is an error fetching the code or if the response is not successful.
 */
export async function fetchAndUpdateCodeIfMatch(
  params: JsonExecutionSdkParams
): Promise<JsonExecutionSdkParams> {
  for (const [action, platforms] of Object.entries(LIT_ACTION_CID_REPOSITORY)) {
    for (const [platform, cid] of Object.entries(
      platforms as Record<string, string>
    )) {
      if (cid === params.ipfsId) {
        try {
          const res = await fetch(
            `${WRAPPED_KEY_FALLBACK_SERVICE}/${action}/${platform}`
          );
          if (!res.ok) {
            throw new Error(
              `Failed to fetch the code for ${action} on ${platform}`
            );
          }
          const code = await res.text();

          params.code = code;
          params.ipfsId = undefined;

          return params;
        } catch (error) {
          throw new Error(
            `Error fetching code for ${action} on ${platform}: ${JSON.stringify(
              error
            )}`
          );
        }
      }
    }
  }
  return params;
}
