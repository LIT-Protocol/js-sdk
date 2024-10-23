import { SiweMessage } from 'siwe';
import { z } from 'zod';

import {
  AttenuationsObjectSchema,
  AuthMethodSchema,
  AuthSigSchema,
  ChainSchema,
  CosmosWalletTypeSchema,
  IpfsOptionsSchema,
  JsonSchema,
  LitAbilitySchema,
  LitActionSdkParamsSchema,
  LitContractContextSchema,
  LitContractResolverContextSchema,
  LitNetworkKeysSchema,
  LitResourcePrefixSchema,
  SessionKeyPairSchema,
  StorageProviderSchema,
} from './schemas';

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

export const AuthCallbackParamsSchema = LitActionSdkParamsSchema.extend({
  /**
   * The serialized session key pair to sign. If not provided, a session key pair will be fetched from localStorge or generated.
   */
  sessionKey: SessionKeyPairSchema.optional(),
  /**
   * The chain you want to use.  Find the supported list of chains here: https://developer.litprotocol.com/docs/supportedChains
   */
  chain: ChainSchema,
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

export const LitNodeClientConfigSchema = z.object({
  litNetwork: LitNetworkKeysSchema,
  alertWhenUnauthorized: z.boolean().optional(),
  minNodeCount: z.number().optional(),
  debug: z.boolean().optional(),
  connectTimeout: z.number().optional(),
  checkNodeAttestation: z.boolean().optional(),
  contractContext: z
    .union([LitContractContextSchema, LitContractResolverContextSchema])
    .optional(),
  storageProvider: StorageProviderSchema.optional(),
  defaultAuthCallback: z
    .function()
    .args(AuthCallbackParamsSchema)
    .returns(z.promise(AuthSigSchema))
    .optional(),
  rpcUrl: z.string().optional(),
});

export const AuthCallbackSchema = z
  .function()
  .args(AuthCallbackParamsSchema)
  .returns(z.promise(AuthSigSchema));

export const ISessionCapabilityObjectSchema = z.object({
  attenuations: AttenuationsObjectSchema,
  proofs: z.array(z.string()),
  statement: z.string(),
  addProof: z.function().args(z.string()).returns(z.void()),
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
      z.record(z.string(), JsonSchema).optional()
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
      z.record(z.string(), JsonSchema).optional()
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

export const GetWalletSigPropsSchema = LitActionSdkParamsSchema.extend({
  authNeededCallback: AuthCallbackSchema.optional(),
  chain: ChainSchema,
  sessionCapabilityObject: ISessionCapabilityObjectSchema,
  switchChain: z.boolean().optional(),
  expiration: z.string(),
  sessionKey: SessionKeyPairSchema,
  sessionKeyUri: z.string(),
  nonce: z.string(),
  resourceAbilityRequests: z.array(LitResourceAbilityRequestSchema).optional(),
});

export const SessionSigningTemplateSchema = z.object({
  sessionKey: z.string(),
  resourceAbilityRequests: z.array(LitResourceAbilityRequestSchema),
  capabilities: z.array(z.any()), // TODO
  issuedAt: z.string(),
  expiration: z.string(),
  nodeAddress: z.string(),
});

export const CommonGetSessionSigsPropsSchema = z.object({
  /**
   * Session signature properties shared across all functions that generate session signatures.
   */
  pkpPublicKey: z.string().optional(),
  /**
   * When this session signature will expire. After this time is up you will need to reauthenticate, generating a new session signature. The default time until expiration is 24 hours. The formatting is an [RFC3339](https://datatracker.ietf.org/doc/html/rfc3339) timestamp.
   */
  expiration: z.any().optional(),
  /**
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
   * The session capability object that you want to request for this session.
   * It is likely you will not need this, as the object will be automatically derived from the `resourceAbilityRequests`.
   * If you pass nothing, then this will default to a wildcard for each type of resource you're accessing.
   * The wildcard means that the session will be granted the ability to perform operations with any access control condition.
   */
  sessionCapabilityObject: ISessionCapabilityObjectSchema.optional(),
  /**
   * If you want to ask MetaMask to try and switch the user's chain, you may pass true here. This will only work if the user is using MetaMask, otherwise this will be ignored.
   */
  switchChain: z.oboolean().optional(),
  /**
   * The serialized session key pair to sign.
   * If not provided, a session key pair will be fetched from localStorage or generated.
   */
  sessionKey: SessionKeyPairSchema.optional(),
  /**
   * @deprecated - use capabilityAuthSigs instead
   * Used for delegation of Capacity Credit. This signature will be checked for proof of capacity credit.
   * Capacity credits are required on the paid Lit networks (mainnets and certain testnets), and are not required on the unpaid Lit networks (certain testnets).
   * See more [here](https://developer.litprotocol.com/sdk/capacity-credits).
   */
  capacityDelegationAuthSig: AuthSigSchema.optional(),
  /**
   * Not limited to capacityDelegationAuthSig. Other AuthSigs with other purposes can also be in this array.
   */
  capabilityAuthSigs: z.array(AuthSigSchema).optional(),
});

export const GetPkpSessionSigsSchema = CommonGetSessionSigsPropsSchema.merge(
  LitActionSdkParamsSchema
).extend({
  pkpPublicKey: z.string(),
  /**
   * Lit Protocol supported auth methods: https://developer.litprotocol.com/v3/sdk/wallets/auth-methods
   * This CANNOT be used for custom auth methods. For custom auth methods, please pass the customAuth
   * object to jsParams, and handle the custom auth method in your Lit Action.
   *
   * Notes for internal dev: for the SDK, this value can be omitted, but it needs to be an empty array [] set in the SDK before
   * sending it to the node
   */
  authMethods: z.array(AuthMethodSchema).optional(),
  ipfsOptions: IpfsOptionsSchema.optional(),
});

export const BaseProviderGetSessionSigsPropsSchema =
  CommonGetSessionSigsPropsSchema.merge(LitActionSdkParamsSchema).extend({
    /**
     * This is a callback that will be used to generate an AuthSig within the session signatures. It's inclusion is required, as it defines the specific resources and abilities that will be allowed for the current session.
     */
    authNeededCallback: AuthCallbackSchema.optional(),
  });

export const GetSessionSigsPropsSchema = CommonGetSessionSigsPropsSchema.merge(
  LitActionSdkParamsSchema
).extend({
  /**
   * This is a callback that will be used to generate an AuthSig within the session signatures. It's inclusion is required, as it defines the specific resources and abilities that will be allowed for the current session.
   */
  authNeededCallback: AuthCallbackSchema,
});

// pub struct JsonSignSessionKeyRequest {
//     pub session_key: String,
//     pub auth_methods: Vec<AuthMethod>,
//     pub pkp_public_key: String,
//     pub auth_sig: Option<AuthSigItem>,
//     pub siwe_message: String,
// }
export const SignSessionKeyPropSchema = LitActionSdkParamsSchema.extend({
  /**
   * The serialized session key pair to sign. If not provided, a session key pair will be fetched from localStorge or generated.
   */
  sessionKey: SessionKeyPairSchema.optional(),
  /**
   * The statement text to place at the end of the SIWE statement field.
   */
  statement: z.string().optional(),
  /**
   * The auth methods to use to sign the session key
   */
  authMethods: z.array(AuthMethodSchema),
  /**
   * The public key of the PKP
   */
  pkpPublicKey: z.string().optional(),
  /**
   * The auth sig of the user.  Returned via the checkAndSignAuthMessage function
   */
  authSig: AuthSigSchema.optional(),
  /**
   * When this session signature will expire.  The user will have to reauthenticate after this time using whatever auth method you set up.  This means you will have to call this signSessionKey function again to get a new session signature.  This is a RFC3339 timestamp.  The default is 24 hours from now.
   */
  expiration: z.string().optional(),
  resources: z.any(), // TODO
  chainId: z.number().optional(),
  /**
   * domain param is required, when calling from environment that doesn't have the 'location' object. i.e. NodeJs server.
   */
  domain: z.string().optional(),
  /**
   * A LIT resource ability is a combination of a LIT resource and a LIT ability.
   */
  resourceAbilityRequests: z.array(LitResourceAbilityRequestSchema).optional(),
});
