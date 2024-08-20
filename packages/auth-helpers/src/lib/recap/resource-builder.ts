import { LIT_ABILITY, LIT_ABILITY_VALUES } from '@lit-protocol/constants';
import { ILitResource } from '../models';
import {
  LitAccessControlConditionResource,
  LitActionResource,
  LitPKPResource,
  LitRLIResource,
} from '../resources';

/**
 * Lit resrouce ability request builder for creating resource ability requests.
 *
 * @example
 * import { ResourceAbilityRequestBuilder } from '@lit-protocol/auth-helpers';

const builder = new ResourceAbilityRequestBuilder();

builder
  .addPKPSigningRequest('*') // PKP Signing
  .addLitActionExecutionRequest('*') // Lit Action Execution
  .addAccessControlConditionSigningRequest('*') // ACC Signing
  .addAccessControlConditionDecryptionRequest('*') // ACC Decryption
  .addRateLimitIncreaseAuthRequest('*'); // RLI Authentication

const requests = builder.build();

 */
export class ResourceAbilityRequestBuilder {
  private requests: Array<{
    resource: ILitResource;
    ability: LIT_ABILITY_VALUES;
  }> = [];

  /**
   * Adds a PKP signing request to the builder.
   * @param resourceId - The ID of the resource.
   * @returns The builder instance.
   */
  addPKPSigningRequest(resourceId: string): this {
    this.requests.push({
      resource: new LitPKPResource(resourceId),
      ability: LIT_ABILITY.PKPSigning,
    });
    return this;
  }

  /**
   * Adds a Lit action execution request to the builder.
   * @param resourceId - The ID of the resource.
   * @returns The builder instance.
   */
  addLitActionExecutionRequest(resourceId: string): this {
    this.requests.push({
      resource: new LitActionResource(resourceId),
      ability: LIT_ABILITY.LitActionExecution,
    });
    return this;
  }

  /**
   * Adds an access control condition signing request to the builder.
   * @param resourceId - The ID of the resource.
   * @returns The builder instance.
   */
  addAccessControlConditionSigningRequest(resourceId: string): this {
    this.requests.push({
      resource: new LitAccessControlConditionResource(resourceId),
      ability: LIT_ABILITY.AccessControlConditionSigning,
    });
    return this;
  }

  /**
   * Adds an access control condition decryption request to the builder.
   * @param resourceId - The ID of the resource.
   * @returns The builder instance.
   */
  addAccessControlConditionDecryptionRequest(resourceId: string): this {
    this.requests.push({
      resource: new LitAccessControlConditionResource(resourceId),
      ability: LIT_ABILITY.AccessControlConditionDecryption,
    });
    return this;
  }

  /**
   * Adds a rate limit increase authentication request to the builder.
   * @param resourceId - The ID of the resource.
   * @returns The builder instance.
   */
  addRateLimitIncreaseAuthRequest(resourceId: string): this {
    this.requests.push({
      resource: new LitRLIResource(resourceId),
      ability: LIT_ABILITY.RateLimitIncreaseAuth,
    });
    return this;
  }

  /**
   * Builds the array of resource ability requests.
   * @returns The array of resource ability requests.
   */
  build(): Array<{ resource: ILitResource; ability: LIT_ABILITY_VALUES }> {
    return this.requests;
  }
}
