import { ExecuteJsResponse } from '@lit-protocol/types';

import {
  litActionCodeRepository,
  litActionCodeRepositoryCommon,
} from './code-repository';
import {
  LIT_ACTION_CID_REPOSITORY,
  LIT_ACTION_CID_REPOSITORY_COMMON,
} from './constants';
import { LitActionType, LitActionTypeCommon } from './types';
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
  // We already have guarantees that `actionType` is valid; it is not user provided and type-safe
  assertNetworkIsValid(network);

  return LIT_ACTION_CID_REPOSITORY[actionType][network];
}

export function getLitActionCode(
  network: Network,
  actionType: LitActionType
): string {
  // We already have guarantees that `actionType` is valid; it is not user provided and type-safe
  assertNetworkIsValid(network);

  // No fuzzy validation needed here, because `setLitActionsCode()` validates its input
  return litActionCodeRepository[actionType][network];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function assertNetworkIsValid(network: any): asserts network is Network {
  const validNetworks: Network[] = ['evm', 'solana'];

  if (!validNetworks.includes(network)) {
    throw new Error(
      `Invalid network: ${network}. Must be one of ${validNetworks.join(', ')}.`
    );
  }
}

/**
 * Fetch the Lit action code or its IPFS CID for a given network and action type.
 * @private
 *
 * @param {Network} network The network to get the code or CID for.
 * @param {LitActionType} actionType The type of action to get the code or CID for.
 * @returns {{ litActionCode?: string, litActionIpfsCid?: string }} The Lit action code or its IPFS CID.
 */
export function getLitActionCodeOrCid(
  network: Network,
  actionType: LitActionType
): { litActionCode?: string; litActionIpfsCid?: string } {
  // Default state is that litActionCode will be falsy, unless someone has injected to it using `setLitActionsCode();
  const litActionCode = getLitActionCode(network, actionType);

  if (litActionCode) {
    return { litActionCode };
  }
  return { litActionIpfsCid: getLitActionCid(network, actionType) };
}

/**
 * Fetch the Lit action code or its IPFS CID for a given network and action type.
 * @private
 * @param {LitActionTypeCommon} actionType The type of action to get the code or CID for.
 * @returns {{ litActionCode?: string, litActionIpfsCid?: string }} The Lit action code or its IPFS CID.
 */
export function getLitActionCodeOrCidCommon(actionType: LitActionTypeCommon): {
  litActionCode?: string;
  litActionIpfsCid?: string;
} {
  // Default state is that litActionCode will be falsy, unless someone has injected to it using `setLitActionsCode();
  const litActionCode = getLitActionCodeCommon(actionType);

  if (litActionCode) {
    return { litActionCode };
  }
  return { litActionIpfsCid: getLitActionCidCommon(actionType) };
}

export function getLitActionCidCommon(actionType: LitActionTypeCommon) {
  return LIT_ACTION_CID_REPOSITORY_COMMON[actionType];
}

export function getLitActionCodeCommon(
  actionType: LitActionTypeCommon
): string {
  // No fuzzy validation needed here, because `setLitActionsCodeCommon()` validates its input
  return litActionCodeRepositoryCommon[actionType];
}
