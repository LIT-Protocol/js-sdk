import { SiweMessage } from 'siwe';
import { z } from 'zod';

import {
  AttenuationsObjectSchema,
  AuthSigSchema,
  ChainSchema,
  CosmosWalletTypeSchema,
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
  resourceAbilityRequests: LitResourceAbilityRequestSchema.optional(),
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
      z.any().optional() // TODO
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
