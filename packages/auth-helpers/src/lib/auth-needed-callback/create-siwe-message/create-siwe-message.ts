import * as siwe from 'siwe';
import {
  CapacityCreditsFields,
  createCapacityDelegationRecapObject,
} from '../create-recap-object/create-capacity-delegation-recap';

export interface BaseSiweMessage {
  walletAddress: string;
  nonce: string;

  // -- filled in by default
  expiration?: string;
  resources?: string[];
  uri?: string; // This is important in authNeededCallback params eg. (lit:session:xxx)
  domain?: string;
  statement?: string;
  version?: string;
  chainId?: number;
}

export interface AuthCallbackFields extends BaseSiweMessage {
  uri: string;
  expiration: string;
  resources: string[];
}

export enum SIWE_URI {
  // SESSION_KEY = 'lit:session:',
  CAPABILITY_DELEGATION = 'lit:capability:delegation',
}

/**
 * Based on the type, we will decide how to fill the siwe message
 */
export enum CreateSiweType {
  DEFAULT = 'DEFAULT',
  CAPABILITY_DELEGATION = 'CAPABILITY_DELEGATION',
  // LIT_ACTION = 'LIT_ACTION',
}

export const createSiweMessage = async <T extends BaseSiweMessage>(
  params: T,
  type?: CreateSiweType
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

    ...(params.resources && { resources: params.resources }),
  };

  // -- modify params based on type
  if (type === CreateSiweType.CAPABILITY_DELEGATION) {
    siweParams.uri = SIWE_URI.CAPABILITY_DELEGATION;
  }

  let siweMessage = new siwe.SiweMessage(siweParams);

  // -- add recap object if needed
  if (type === CreateSiweType.CAPABILITY_DELEGATION) {
    const recapObject = await createCapacityDelegationRecapObject(
      params as unknown as CapacityCreditsFields
    );

    siweMessage = recapObject.addToSiweMessage(siweMessage);
  }

  return siweMessage.prepareMessage();
};
