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

// Define the builder interface
interface IResourceBuilder {
  addPKPSigningRequest: (resourceId: string) => IResourceBuilder;
  addLitActionExecutionRequest: (resourceId: string) => IResourceBuilder;
  addAccessControlConditionSigningRequest: (
    resourceId: string
  ) => IResourceBuilder;
  addAccessControlConditionDecryptionRequest: (
    resourceId: string
  ) => IResourceBuilder;
  addPaymentDelegationRequest: (resourceId: string) => IResourceBuilder;
  readonly requests: Array<{
    resource: ILitResource;
    ability: LIT_ABILITY_VALUES;
  }>;
  getResources: () => Array<{
    resource: ILitResource;
    ability: LIT_ABILITY_VALUES;
  }>;
}

export const createResourceBuilder = (): IResourceBuilder => {
  const requestsArray: Array<{
    resource: ILitResource;
    ability: LIT_ABILITY_VALUES;
  }> = [];

  // Need to declare the builder object first so its methods can refer to it.
  const builder: IResourceBuilder = {
    addPKPSigningRequest(resourceId: string) {
      requestsArray.push({
        resource: new LitPKPResource(resourceId),
        ability: LIT_ABILITY.PKPSigning,
      });
      return builder; // Return the builder instance
    },

    addLitActionExecutionRequest(resourceId: string) {
      requestsArray.push({
        resource: new LitActionResource(resourceId),
        ability: LIT_ABILITY.LitActionExecution,
      });
      return builder; // Return the builder instance
    },

    addAccessControlConditionSigningRequest(resourceId: string) {
      requestsArray.push({
        resource: new LitAccessControlConditionResource(resourceId),
        ability: LIT_ABILITY.AccessControlConditionSigning,
      });
      return builder; // Return the builder instance
    },

    addAccessControlConditionDecryptionRequest(resourceId: string) {
      requestsArray.push({
        resource: new LitAccessControlConditionResource(resourceId),
        ability: LIT_ABILITY.AccessControlConditionDecryption,
      });
      return builder; // Return the builder instance
    },

    addPaymentDelegationRequest(resourceId: string) {
      requestsArray.push({
        resource: new LitPaymentDelegationResource(resourceId),
        ability: LIT_ABILITY.PaymentDelegation,
      });
      return builder; // Return the builder instance
    },

    get requests(): Array<{
      resource: ILitResource;
      ability: LIT_ABILITY_VALUES;
    }> {
      return requestsArray;
    },

    getResources() {
      return requestsArray;
    },
  };

  return builder;
};
