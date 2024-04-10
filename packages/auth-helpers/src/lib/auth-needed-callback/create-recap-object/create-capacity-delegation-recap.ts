import { LitAbility } from '@lit-protocol/types';
import { LitRLIResource } from '../../resources';
import { BaseSiweMessage } from '../create-siwe-message/create-siwe-message';

export interface CapacityCreditsFields extends BaseSiweMessage {
  litNodeClient: any;
  capacityTokenId?: string;
  delegateeAddresses?: string[];
  uses?: string;
}

export const createCapacityDelegationRecapObject = async (
  params: CapacityCreditsFields
) => {
  if (!params.litNodeClient) {
    throw new Error('litNodeClient is required');
  }

  const uses = params.uses ?? '1';
  const litResource = new LitRLIResource(params.capacityTokenId ?? '*');

  const recapObject =
    await params.litNodeClient.generateSessionCapabilityObjectWithWildcards([
      litResource,
    ]);

  const capabilities = {
    ...(params.capacityTokenId ? { nft_id: [params.capacityTokenId] } : {}), // Conditionally include nft_id
    ...(params.delegateeAddresses
      ? {
          delegate_to: params.delegateeAddresses.map((address) =>
            address.startsWith('0x') ? address.slice(2) : address
          ),
        }
      : {}),
    uses: uses.toString(),
  };

  recapObject.addCapabilityForResource(
    litResource,
    LitAbility.RateLimitIncreaseAuth,
    capabilities
  );

  // make sure that the resource is added to the recapObject
  const verified = recapObject.verifyCapabilitiesForResource(
    litResource,
    LitAbility.RateLimitIncreaseAuth
  );

  // -- validate
  if (!verified) {
    throw new Error('Failed to verify capabilities for resource');
  }

  return recapObject;
};
