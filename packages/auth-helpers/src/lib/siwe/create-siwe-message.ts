import { SiweMessage } from 'siwe';
import { BaseSiweMessage, CapacityDelegationFields } from '@lit-protocol/types';
import {
  LitAbility,
  WithCapacityDelegation,
  WithRecap,
} from '@lit-protocol/types';
import { LitRLIResource } from '../resources';

import {
  createCapacityCreditsResourceData,
  addRecapToSiweMessage,
} from './siwe-helper';

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

  let siweParams = {
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
    'uses' in params ||
    'delegateeAddresses' in params ||
    'capacityTokenId' in params
  ) {
    const ccParams = params as CapacityDelegationFields;

    const capabilities = createCapacityCreditsResourceData(ccParams);

    params.resources = [
      {
        resource: new LitRLIResource(ccParams.capacityTokenId ?? '*'),
        ability: LitAbility.RateLimitIncreaseAuth,
        data: capabilities,
      },
    ];
  }

  // -- add recap resources if needed
  if (params.resources) {
    siweMessage = await addRecapToSiweMessage({
      siweMessage,
      resources: params.resources,
      litNodeClient: params.litNodeClient,
    });
  }

  return siweMessage.prepareMessage();
};
export const createSiweMessageWithRecaps = async (
  params: WithRecap
): Promise<string> => {
  return createSiweMessage({
    ...params,
  });
};
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
