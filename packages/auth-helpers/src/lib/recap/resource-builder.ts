import { LIT_ABILITY, LIT_ABILITY_VALUES } from '@lit-protocol/constants';
import { ILitResource } from '@lit-protocol/types';
import {
  LitAccessControlConditionResource,
  LitActionResource,
  LitPaymentDelegationResource,
  LitPKPResource,
} from '../resources';

/**
 * Creates a resource ability request builder for creating resource ability requests.
 *
 * @example
 * import { createResourceBuilder } from '@lit-protocol/auth-helpers';

const builder = createResourceBuilder();

builder
  .addPKPSigningRequest('*') // PKP Signing
  .addLitActionExecutionRequest('*') // Lit Action Execution
  .addAccessControlConditionSigningRequest('*') // ACC Signing
  .addAccessControlConditionDecryptionRequest('*') // ACC Decryption
  .addPaymentDelegationRequest('*'); // Payment Delegation

const requests = builder.build();

 */
export const createResourceBuilder = () => {
  const requests: Array<{
    resource: ILitResource;
    ability: LIT_ABILITY_VALUES;
  }> = [];

  return {
    /**
     * Adds a PKP signing request to the builder.
     * @param resourceId - The ID of the resource.
     * @returns The builder instance.
     */
    addPKPSigningRequest(resourceId: string) {
      requests.push({
        resource: new LitPKPResource(resourceId),
        ability: LIT_ABILITY.PKPSigning,
      });
      return this;
    },

    /**
     * Adds a Lit action execution request to the builder.
     * @param resourceId - The ID of the resource.
     * @returns The builder instance.
     */
    addLitActionExecutionRequest(resourceId: string) {
      requests.push({
        resource: new LitActionResource(resourceId),
        ability: LIT_ABILITY.LitActionExecution,
      });
      return this;
    },

    /**
     * Adds an access control condition signing request to the builder.
     * @param resourceId - The ID of the resource.
     * @returns The builder instance.
     */
    addAccessControlConditionSigningRequest(resourceId: string) {
      requests.push({
        resource: new LitAccessControlConditionResource(resourceId),
        ability: LIT_ABILITY.AccessControlConditionSigning,
      });
      return this;
    },

    /**
     * Adds an access control condition decryption request to the builder.
     * @param resourceId - The ID of the resource.
     * @returns The builder instance.
     */
    addAccessControlConditionDecryptionRequest(resourceId: string) {
      requests.push({
        resource: new LitAccessControlConditionResource(resourceId),
        ability: LIT_ABILITY.AccessControlConditionDecryption,
      });
      return this;
    },

    /**
     * Adds a rate limit increase authentication request to the builder.
     * @param resourceId - The ID of the resource.
     * @returns The builder instance.
     */
    addPaymentDelegationRequest(resourceId: string) {
      requests.push({
        resource: new LitPaymentDelegationResource(resourceId),
        ability: LIT_ABILITY.PaymentDelegation,
      });
      return this;
    },

    /**
     * Return the array of resource ability requests.
     * @returns The array of resource ability requests.
     */
    get requests(): Array<{
      resource: ILitResource;
      ability: LIT_ABILITY_VALUES;
    }> {
      return requests;
    },

    getResources() {
      return requests;
    },
  };
};
