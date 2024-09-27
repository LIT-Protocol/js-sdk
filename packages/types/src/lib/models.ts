import { SiweMessage } from 'siwe';
import { z } from 'zod';
import { LitAbility, LitAbilitySchema, LitResourcePrefixSchema } from './types';

export type PlainJSON =
  | boolean
  | number
  | string
  | { [key: string]: PlainJSON }
  | Array<PlainJSON>;
export type AttenuationsObject = {
  [key: string]: { [key: string]: Array<PlainJSON> };
};
export type CID = string;

export interface ISessionCapabilityObject {
  get attenuations(): AttenuationsObject;
  get proofs(): Array<CID>;
  get statement(): string;
  addProof(proof: CID): void;

  /**
   * Add an arbitrary attenuation to the session capability object.
   *
   * @description We do NOT recommend using this unless with the LIT specific
   * abilities. Use this ONLY if you know what you are doing.
   */
  addAttenuation(
    resource: string,
    namespace?: string,
    name?: string,
    restriction?: { [key: string]: PlainJSON }
  ): void;
  addToSiweMessage(siwe: SiweMessage): SiweMessage;

  /**
   * Encode the session capability object as a SIWE resource.
   */
  encodeAsSiweResource(): string;

  /** LIT specific methods */

  /**
   * Add a LIT-specific capability to the session capability object for the
   * specified resource.
   *
   * @param litResource The LIT-specific resource being added.
   * @param ability The LIT-specific ability being added.
   * @example If the ability is `LitAbility.AccessControlConditionDecryption`,
   * then the resource should be the hashed key value of the access control
   * condition.
   * @example If the ability is `LitAbility.AccessControlConditionSigning`,
   * then the resource should be the hashed key value of the access control
   * condition.
   * @example If the ability is `LitAbility.PKPSigning`, then the resource
   * should be the PKP token ID.
   * @example If the ability is `LitAbility.RateLimitIncreaseAuth`, then the
   * resource should be the RLI token ID.
   * @example If the ability is `LitAbility.LitActionExecution`, then the
   * resource should be the Lit Action IPFS CID.
   * @throws If the ability is not a LIT-specific ability.
   */
  addCapabilityForResource(
    litResource: ILitResource,
    ability: LitAbility,
    data?: any
  ): void;

  /**
   * Verify that the session capability object has the specified LIT-specific
   * capability for the specified resource.
   */
  verifyCapabilitiesForResource(
    litResource: ILitResource,
    ability: LitAbility
  ): boolean;

  /**
   * Add a wildcard ability to the session capability object for the specified
   * resource.
   */
  addAllCapabilitiesForResource(litResource: ILitResource): void;
}

export const ILitResourceSchema = z.object({
  /**
   * Gets the fully qualified resource key.
   * @returns The fully qualified resource key.
   */
  getResourceKey: z.function().args(z.void()).returns(z.string()),
  /**
   * Validates that the given LIT ability is valid for this resource.
   * @param litAbility The LIT ability to validate.
   */
  isValidLitAbility: z.function().args(LitAbilitySchema).returns(z.boolean()),
  toString: z.function().args(z.void()).returns(z.string()),
  resourcePrefix: LitResourcePrefixSchema,
  resource: z.string(),
});
export type ILitResource = z.infer<typeof ILitResourceSchema>;

/**
 * A LIT resource ability is a combination of a LIT resource and a LIT ability.
 * It specifies which LIT specific ability is being requested to be performed
 * on the specified LIT resource.
 *
 * @description This object does NOT guarantee compatibility between the
 * specified LIT resource and the specified LIT ability, and will be validated by
 * the LIT-internal systems.
 */
export const LitResourceAbilityRequestSchema = z.object({
  resource: ILitResourceSchema,
  ability: LitAbilitySchema,
  data: z.any().optional(),
});
export type LitResourceAbilityRequest = z.infer<
  typeof LitResourceAbilityRequestSchema
>;
