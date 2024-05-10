import { SiweMessage } from 'siwe';
import { AuthSig } from './interfaces';

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

/**
 * These are the user-facing abilities that can be granted to a session.
 */
export enum LitAbility {
  /**
   * This is the ability to process an encryption access control condition.
   * The resource will specify the corresponding hashed key value of the
   * access control condition.
   */
  AccessControlConditionDecryption = 'access-control-condition-decryption',

  /**
   * This is the ability to process a signing access control condition.
   * The resource will specify the corresponding hashed key value of the
   * access control condition.
   */
  AccessControlConditionSigning = 'access-control-condition-signing',

  /**
   * This is the ability to use a PKP for signing purposes. The resource will specify
   * the corresponding PKP token ID.
   */
  PKPSigning = 'pkp-signing',

  /**
   * This is the ability to use a Rate Limit Increase (Capacity Credits NFT) token during
   * authentication with the nodes. The resource will specify the corresponding
   * Capacity Credits NFT token ID.
   */
  RateLimitIncreaseAuth = 'rate-limit-increase-auth',

  /**
   * This is the ability to execute a Lit Action. The resource will specify the
   * corresponding Lit Action IPFS CID.
   */
  LitActionExecution = 'lit-action-execution',
}
/**
 * Prefixes used for identifying various LIT resources.
 *
 * @description These resource prefixes are also used as valid IRI schemes.
 */
export enum LitResourcePrefix {
  AccessControlCondition = 'lit-accesscontrolcondition',
  PKP = 'lit-pkp',
  RLI = 'lit-ratelimitincrease',
  LitAction = 'lit-litaction',
}

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

  /**
   * The AuthSig they insert would own a rate limit nft and can put restrictions on how it * can be used.
   */
  addRateLimitAuthSig(authSig: AuthSig): Promise<void>;
}

export interface ILitResource {
  /**
   * Gets the fully qualified resource key.
   * @returns The fully qualified resource key.
   */
  getResourceKey(): string;

  /**
   * Validates that the given LIT ability is valid for this resource.
   * @param litAbility The LIT ability to validate.
   */
  isValidLitAbility(litAbility: LitAbility): boolean;

  toString(): string;

  readonly resourcePrefix: LitResourcePrefix;
  readonly resource: string;
}

/**
 * A LIT resource ability is a combination of a LIT resource and a LIT ability.
 * It specifies which LIT specific ability is being requested to be performed
 * on the specified LIT resource.
 *
 * @description This object does NOT guarantee compatibility between the
 * specified LIT resource and the specified LIT ability, and will be validated by
 * the LIT-internal systems.
 */
export type LitResourceAbilityRequest = {
  resource: ILitResource;
  ability: LitAbility;
  data?: any;
};
