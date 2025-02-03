import { SiweMessage } from 'siwe';

import { LIT_ABILITY } from '@lit-protocol/constants';
import {
  BaseSiweMessage,
  CapacityDelegationFields,
  WithCapacityDelegation,
  WithRecap,
} from '@lit-protocol/types';

import {
  addRecapToSiweMessage,
  createCapacityCreditsResourceData,
} from './siwe-helper';

/**
 * Creates a SIWE
 * @param { BaseSiweMessage } params - The parameters for creating the SIWE message.
 * @returns A promise that resolves to the created SIWE message as a string.
 * @throws An error if the walletAddress parameter is missing.
 */
export const createSiweMessage = async <T extends BaseSiweMessage>(
  params: T
): Promise<string> => {
  // -- validations
  if (!params.walletAddress) {
    throw new Error('walletAddress is required');
  }

  const ONE_WEEK_FROM_NOW = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 7
  ).toISOString();

  const siweParams = {
    domain: params?.domain ?? 'localhost',
    address: params.walletAddress,
    statement:
      params?.statement ??
      'This is a test statement.  You can put anything you want here.',
    uri: params?.uri ?? 'https://localhost/login',
    version: params?.version ?? '1',
    chainId: params?.chainId ?? 1,
    nonce: params.nonce,
    expirationTime: params?.expiration ?? ONE_WEEK_FROM_NOW,
  };

  let siweMessage = new SiweMessage(siweParams);

  // -- create a message with capacity credits
  if (
    'dAppOwnerWallet' in params || // required param
    'uses' in params || // optional
    'delegateeAddresses' in params // optional
    // 'capacityTokenId' in params // optional
  ) {
    const ccParams = params as CapacityDelegationFields;

    const capabilities = createCapacityCreditsResourceData(ccParams);

    params.resources = [
      {
        // TODO: new resource to be used
        //   resource: new LitRLIResource(ccParams.capacityTokenId ?? '*'),
        //   ability: LIT_ABILITY.RateLimitIncreaseAuth,

        // @ts-ignore - TODO: new resource to be used
        resource: null,

        // @ts-ignore - TODO: new ability to be used
        ability: null,
        data: capabilities,
      },
    ];
  }

  // -- add recap resources if needed
  if (params.resources) {
    if (!params.litNodeClient) {
      throw new Error('litNodeClient is required');
    }

    siweMessage = await addRecapToSiweMessage({
      siweMessage,
      resources: params.resources,
      litNodeClient: params.litNodeClient,
    });
  }

  return siweMessage.prepareMessage();
};

/**
 * Creates a SIWE message with recaps added to it.
 *
 * @param { WithRecap } params - The parameters for creating the SIWE message with recaps.
 * @returns A Promise that resolves to a string representing the SIWE message.
 */
export const createSiweMessageWithRecaps = async (
  params: WithRecap
): Promise<string> => {
  return createSiweMessage({
    ...params,
  });
};

/**
 * Creates a SIWE message with capacity delegation.
 * @param { WithCapacityDelegation } params - The parameters for creating the SIWE message.
 * @returns A Promise that resolves to the created SIWE message.
 * @throws An error if litNodeClient is not provided.
 */
export const createSiweMessageWithCapacityDelegation = async (
  params: WithCapacityDelegation
) => {
  if (!params.litNodeClient) {
    throw new Error('litNodeClient is required');
  }

  return createSiweMessage({
    ...params,
  });
};
