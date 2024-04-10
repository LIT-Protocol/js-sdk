import * as siwe from 'siwe';
import {
  CapacityCreditsFields,
  createCapacityDelegationRecapObject,
} from '../create-recap-object/create-capacity-delegation-recap';
import { LitResourceAbilityRequest } from '@lit-protocol/types';
import { LIT_URI } from '@lit-protocol/constants';

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
  type: CreateSiweType;
}

export interface AuthCallbackFields extends BaseSiweMessage {
  uri: string;
  expiration: string;
  resources: string[];
}

export interface WithRecapFields extends BaseSiweMessage {
  litNodeClient: any;
  resourceAbilityRequests: LitResourceAbilityRequest[];
  type: CreateSiweType.WITH_RECAP;
}

/**
 * Based on the type, we will decide how to fill the siwe message
 */
export enum CreateSiweType {
  DEFAULT = 'DEFAULT',
  CAPABILITY_DELEGATION = 'CAPABILITY_DELEGATION',
  WITH_RECAP = 'WITH_RECAP',
}

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

    ...(params.resources && { resources: params.resources }),
  };

  // -- override URI for CAPABILITY_DELEGATION
  if (params.type === CreateSiweType.CAPABILITY_DELEGATION) {
    siweParams.uri = LIT_URI.CAPABILITY_DELEGATION;
  }

  let siweMessage = new siwe.SiweMessage(siweParams);

  // -- add recap object if needed
  if (params?.type === CreateSiweType.CAPABILITY_DELEGATION) {
    const recapObject = await createCapacityDelegationRecapObject(
      params as unknown as CapacityCreditsFields
    );

    siweMessage = recapObject.addToSiweMessage(siweMessage);
  }

  if (params?.type === CreateSiweType.WITH_RECAP) {
    // --- starts
    const _params = params as unknown as WithRecapFields;
    _params;

    for (const request of _params.resourceAbilityRequests) {
      const recapObject =
        await _params.litNodeClient.generateSessionCapabilityObjectWithWildcards(
          [request.resource]
        );

      recapObject.addCapabilityForResource(request.resource, request.ability);

      const verified = recapObject.verifyCapabilitiesForResource(
        request.resource,
        request.ability
      );

      if (!verified) {
        throw new Error(
          `Failed to verify capabilities for resource: "${request.resource}" and ability: "${request.ability}`
        );
      }

      siweMessage = recapObject.addToSiweMessage(siweMessage);
    }
    // --- ends
  }

  return siweMessage.prepareMessage();
};
