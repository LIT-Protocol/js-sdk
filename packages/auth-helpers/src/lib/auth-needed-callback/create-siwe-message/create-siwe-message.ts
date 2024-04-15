import * as siwe from 'siwe';
import {
  BaseSiweMessage,
  CapacityDelegationFields,
  CapacityDelegationRequest,
  ILitNodeClient,
  LitAbility,
  LitResourceAbilityRequest,
} from '@lit-protocol/types';
import { LitRLIResource } from '@lit-protocol/auth-helpers';
import { LIT_URI } from '@lit-protocol/constants';

export interface WithRecap extends BaseSiweMessage {
  uri: string;
  expiration: string;
  resources: LitResourceAbilityRequest[];
}

export interface WithCapacityDelegation extends BaseSiweMessage {
  uri: LIT_URI.CAPABILITY_DELEGATION;
  litNodeClient: any;
  capacityTokenId?: string;
  delegateeAddresses?: string[];
  uses?: string;
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
  };

  let siweMessage = new siwe.SiweMessage(siweParams);

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

export const createCapacityCreditsResourceData = (
  params: CapacityDelegationFields
): CapacityDelegationRequest => {
  return {
    ...(params.capacityTokenId ? { nft_id: [params.capacityTokenId] } : {}), // Conditionally include nft_id
    ...(params.delegateeAddresses
      ? {
        delegate_to: params.delegateeAddresses.map((address) =>
          address.startsWith('0x') ? address.slice(2) : address
        ),
      }
      : {}),
    uses: params.uses!.toString() || '1',
  };
};

export const addRecapToSiweMessage = async ({
  siweMessage,
  resources,
  litNodeClient,
}: {
  siweMessage: siwe.SiweMessage;
  resources: LitResourceAbilityRequest[];
  litNodeClient: ILitNodeClient;
}) => {


  if (!resources || resources.length < 1) {
    throw new Error('resources is required');
  }

  if (!litNodeClient) {
    throw new Error('litNodeClient is required');
  }

  for (const request of resources) {
    const recapObject =
      await litNodeClient.generateSessionCapabilityObjectWithWildcards([
        request.resource,
      ]);

    recapObject.addCapabilityForResource(
      request.resource,
      request.ability,
      request.data || null
    );

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

  return siweMessage;
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
