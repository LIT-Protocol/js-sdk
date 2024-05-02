import { ILitResource, LitAbility } from '../models';
import {
  LitAccessControlConditionResource,
  LitActionResource,
  LitPKPResource,
  LitRLIResource,
} from '../resources';

/**
 * Lit resrouce ability request builder for creating resource ability requests.
 */
export class ResourceAbilityRequestBuilder {
  private requests: Array<{ resource: ILitResource; ability: LitAbility }> = [];

  /**
   * Adds a PKP signing request to the builder.
   * @param resourceId - The ID of the resource.
   * @returns The builder instance.
   */
  addPKPSigningRequest(resourceId: string): this {
    this.requests.push({
      resource: new LitPKPResource(resourceId),
      ability: LitAbility.PKPSigning,
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
      ability: LitAbility.LitActionExecution,
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
      ability: LitAbility.AccessControlConditionSigning,
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
      ability: LitAbility.AccessControlConditionDecryption,
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
      ability: LitAbility.RateLimitIncreaseAuth,
    });
    return this;
  }

  /**
   * Builds the array of resource ability requests.
   * @returns The array of resource ability requests.
   */
  build(): Array<{ resource: ILitResource; ability: LitAbility }> {
    return this.requests;
  }
}
