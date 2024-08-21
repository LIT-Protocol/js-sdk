import { ExecuteJsResponse, JsonExecutionSdkParams } from '@lit-protocol/types';

import { LIT_ACTION_CID_REPOSITORY } from './constants';
import { LitActionType } from './types';
import { Network } from '../types';

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
