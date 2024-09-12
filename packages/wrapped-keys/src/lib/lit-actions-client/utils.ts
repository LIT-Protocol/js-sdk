import { ExecuteJsResponse } from '@lit-protocol/types';

import {
  LIT_ACTION_BUNDLED_CODE_PATH,
  LIT_ACTION_CID_REPOSITORY,
} from './constants';
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

export function getLitActionCode(
  network: Network,
  actionType: LitActionType
): string {
  const litActionCode = LIT_ACTION_BUNDLED_CODE_PATH[actionType][network];

  if (!litActionCode) {
    throw new Error(
      `Could not find Lit Action code for action type: ${actionType}`
    );
  }
  return litActionCode;
}

/**
 * Fetch the Lit action code or its IPFS CID for a given network and action type.
 *
 * @param {Network} network The network to get the code or CID for.
 * @param {LitActionType} actionType The type of action to get the code or CID for.
 * @returns {{ litActionCode?: string, litActionIpfsCid?: string }} The Lit action code or its IPFS CID.
 */
export function getLitActionCodeOrCid(
  network: Network,
  actionType: LitActionType
): { litActionCode?: string; litActionIpfsCid?: string } {
  let litActionCode: string | undefined;
  let litActionIpfsCid: string | undefined;

  try {
    litActionCode = getLitActionCode(network, actionType);
  } catch (e) {
    console.warn(
      `Missing bundled code or could not get it for action type: ${actionType} and network: ${network}. Using IPFS CID instead.`,
      e
    );
    litActionIpfsCid = getLitActionCid(network, actionType);
  }

  if (!litActionCode && !litActionIpfsCid) {
    throw new Error(
      `Could not get Lit Action code nor IPFS CID for action type: ${actionType} and network: ${network}`
    );
  }

  return { litActionCode, litActionIpfsCid };
}
