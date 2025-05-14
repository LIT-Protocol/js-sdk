import { SiweMessage } from 'siwe';
import { z } from 'zod';

import {
  AttenuationsObjectSchema,
  AuthMethodSchema,
  AuthSigSchema,
  ChainSchema,
  CosmosWalletTypeSchema,
  DefinedJsonSchema,
  EvmChainSchema,
  ExecuteJsAdvancedOptionsSchema,
  ExpirationSchema,
  IpfsOptionsSchema,
  LitAbilitySchema,
  LitActionSdkParamsSchema,
  LitResourcePrefixSchema,
  PricedSchema,
  SessionKeyPairSchema,
} from './schemas';

export const ILitResourceSchema = z.object({
  /**
   * Gets the fully qualified resource key.
   * @returns The fully qualified resource key.
   */
  getResourceKey: z.function().args().returns(z.string()),
  /**
   * Validates that the given LIT ability is valid for this resource.
   * @param litAbility The LIT ability to validate.
   */
  isValidLitAbility: z.function().args(LitAbilitySchema).returns(z.boolean()),
  toString: z.function().args().returns(z.string()),
  resourcePrefix: LitResourcePrefixSchema.readonly(),
  resource: z.string().readonly(),
});

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
  data: z.record(z.string(), DefinedJsonSchema).optional(),
});

export const AuthCallbackParamsSchema = LitActionSdkParamsSchema.extend({
  /**
   * The serialized session key pair to sign. If not provided, a session key pair will be fetched from localStorge or generated.
   */
  sessionKey: SessionKeyPairSchema.optional(),
  /**
   * The chain you want to use.  Find the supported list of chains here: https://developer.litprotocol.com/docs/supportedChains
   */
  chain: EvmChainSchema,
  /**
   *   The statement that describes what the user is signing. If the auth callback is for signing a SIWE message, you MUST add this statement to the end of the SIWE statement.
   */
  statement: z.string().optional(),
  /**
   * The blockhash that the nodes return during the handshake
   */
  nonce: z.string(),
  /**
   * Optional and only used with EVM chains.  A list of resources to be passed to Sign In with Ethereum.  These resources will be part of the Sign in with Ethereum signed message presented to the user.
   */
  resources: z.array(z.string()).optional(),
  /**
   * Optional and only used with EVM chains right now.  Set to true by default.  Whether or not to ask Metamask or the user's wallet to switch chains before signing.  This may be desired if you're going to have the user send a txn on that chain.  On the other hand, if all you care about is the user's wallet signature, then you probably don't want to make them switch chains for no reason.  Pass false here to disable this chain switching behavior.
   */
  switchChain: z.boolean().optional(),
  // --- Following for Session Auth ---
  expiration: z.string().optional(),
  uri: z.string().optional(),
  /**
   * Cosmos wallet type, to support mutliple popular cosmos wallets
   * Keplr & Cypher -> window.keplr
   * Leap -> window.leap
   */
  cosmosWalletType: CosmosWalletTypeSchema.optional(),
  /**
   * Optional project ID for WalletConnect V2. Only required if one is using checkAndSignAuthMessage and wants to display WalletConnect as an option.
   */
  walletConnectProjectId: z.string().optional(),
  resourceAbilityRequests: z.array(LitResourceAbilityRequestSchema).optional(),
});

export const AuthCallbackSchema = z
  .function()
  .args(AuthCallbackParamsSchema)
  .returns(z.promise(AuthSigSchema));

export const ISessionCapabilityObjectSchema = z.object({
  attenuations: AttenuationsObjectSchema,
  proofs: z.array(z.string()), // CID[]
  statement: z.string(),
  addProof: z.function().args(z.string()).returns(z.void()), // (proof: CID) => void
  /**
   * Add an arbitrary attenuation to the session capability object.
   *
   * @description We do NOT recommend using this unless with the LIT specific
   * abilities. Use this ONLY if you know what you are doing.
   */
  addAttenuation: z
    .function()
    .args(
      z.string(),
      z.string().optional(),
      z.string().optional(),
      z.record(z.string(), DefinedJsonSchema).optional()
    )
    .returns(z.void()),
  addToSiweMessage: z
    .function()
    .args(z.instanceof(SiweMessage))
    .returns(z.instanceof(SiweMessage)),
  /**
   * Encode the session capability object as a SIWE resource.
   */
  encodeAsSiweResource: z.function().returns(z.string()),

  /** LIT specific methods */

  /**
   * Add a LIT-specific capability to the session capability object for the
   * specified resource.
   *
   * @param litResource The LIT-specific resource being added.
   * @param ability The LIT-specific ability being added.
   * @param [data]
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
  addCapabilityForResource: z
    .function()
    .args(
      ILitResourceSchema,
      LitAbilitySchema,
      z.record(z.string(), DefinedJsonSchema).optional()
    )
    .returns(z.void()),
  /**
   * Verify that the session capability object has the specified LIT-specific
   * capability for the specified resource.
   */
  verifyCapabilitiesForResource: z
    .function()
    .args(ILitResourceSchema, LitAbilitySchema)
    .returns(z.boolean()),
  /**
   * Add a wildcard ability to the session capability object for the specified
   * resource.
   */
  addAllCapabilitiesForResource: z
    .function()
    .args(ILitResourceSchema)
    .returns(z.void()),
});

export const AuthenticationContextSchema = LitActionSdkParamsSchema.extend({
  /**
   * Session signature properties shared across all functions that generate session signatures.
   */
  pkpPublicKey: z.string().optional(),

  /**
   * When this session signature will expire. After this time is up you will need to reauthenticate, generating a new session signature. The default time until expiration is 24 hours. The formatting is an [RFC3339](https://datatracker.ietf.org/doc/html/rfc3339) timestamp.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expiration: z.any().optional(),

  /**
   * @deprecated
   * The chain to use for the session signature and sign the session key. This value is almost always `ethereum`. If you're using EVM, this parameter isn't very important.
   */
  chain: ChainSchema.optional(),

  /**
   * An array of resource abilities that you want to request for this session. These will be signed with the session key.
   * For example, an ability is added to grant a session permission to decrypt content associated with a particular Access Control Conditions (ACC) hash. When trying to decrypt, this ability is checked in the `resourceAbilityRequests` to verify if the session has the required decryption capability.
   * @example
   * [{ resource: new LitAccessControlConditionResource('someAccHash`), ability: LitAbility.AccessControlConditionDecryption }]
   */
  resourceAbilityRequests: z.array(LitResourceAbilityRequestSchema),

  /**
   * @deprecated
   * The session capability object that you want to request for this session.
   * It is likely you will not need this, as the object will be automatically derived from the `resourceAbilityRequests`.
   * If you pass nothing, then this will default to a wildcard for each type of resource you're accessing.
   * The wildcard means that the session will be granted the ability to perform operations with any access control condition.
   */
  sessionCapabilityObject: ISessionCapabilityObjectSchema.optional(),

  /**
   * If you want to ask MetaMask to try and switch the user's chain, you may pass true here. This will only work if the user is using MetaMask, otherwise this will be ignored.
   */
  switchChain: z.boolean().optional(),
  /**
   * The serialized session key pair to sign.
   * If not provided, a session key pair will be fetched from localStorage or generated.
   */
  sessionKey: SessionKeyPairSchema.optional(),

  /**
   * Not limited to capacityDelegationAuthSig. Other AuthSigs with other purposes can also be in this array.
   */
  capabilityAuthSigs: z.array(AuthSigSchema).optional(),

  /**
   * This is a callback that will be used to generate an AuthSig within the session signatures. It's inclusion is required, as it defines the specific resources and abilities that will be allowed for the current session.
   */
  authNeededCallback: AuthCallbackSchema.optional(),

  authMethods: z.array(AuthMethodSchema).optional(),

  ipfsOptions: IpfsOptionsSchema.optional(),
});

export const JsonExecutionSdkParamsBaseSchema = LitActionSdkParamsSchema.pick({
  jsParams: true,
})
  .merge(ExecuteJsAdvancedOptionsSchema)
  .merge(PricedSchema.partial())
  .extend({
    /**
     *  JS code to run on the nodes
     */
    code: z.string().optional(),
    /**
     * The IPFS ID of some JS code to run on the nodes
     */
    ipfsId: z.string().optional(),

    /**
     * auth context
     */
    authContext: AuthenticationContextSchema,
  });
