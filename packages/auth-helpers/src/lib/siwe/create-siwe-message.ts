import { SiweMessage } from 'siwe';
import { LIT_ABILITY } from '@lit-protocol/constants';
import { BaseSiweMessage, WithRecap } from '@lit-protocol/types';
import { LitRLIResource } from '../resources';

import {
  createCapacityCreditsResourceData,
  addRecapToSiweMessage,
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
