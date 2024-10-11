import * as ethers from 'ethers';
import { SiweMessage } from 'siwe';
import { z } from 'zod';

import { LIT_AUTH_SIG_CHAIN_KEYS, VMTYPE } from '@lit-protocol/constants';

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
export const JsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(JsonSchema), z.record(JsonSchema)])
);

export const ChainSchema = z.string();

export const LitNetworkKeysSchema = z.enum([
  'datil-dev',
  'datil-test',
  'datil',
  'custom',
] as const);

export const LitContractSchema = z.object({
  address: z.string().optional(),
  abi: z.any().optional(), // TODO: Define ABI type
  name: z.string().optional(),
});

/**
 * Defines a set of contract metadata for bootstrapping
 * network context and interfacing with contracts on Chroncile blockchain
 *
 */
export const ExclusiveLitContractContextSchema = z.object({
  Allowlist: LitContractSchema,
  LITToken: LitContractSchema,
  Multisender: LitContractSchema,
  PKPHelper: LitContractSchema,
  PKPNFT: LitContractSchema,
  PKPNFTMetadata: LitContractSchema,
  PKPPermissions: LitContractSchema,
  PubkeyRouter: LitContractSchema,
  RateLimitNFT: LitContractSchema,
  Staking: LitContractSchema,
  StakingBalances: LitContractSchema,
});

export const LitContractContextSchema =
  ExclusiveLitContractContextSchema.catchall(z.union([z.string(), z.any()]));

export const LitResourcePrefixSchema = z.enum([
  'lit-accesscontrolcondition',
  'lit-pkp',
  'lit-ratelimitincrease',
  'lit-litaction',
] as const);

export const LitAbilitySchema = z.enum([
  'access-control-condition-decryption',
  'access-control-condition-signing',
  'pkp-signing',
  'rate-limit-increase-auth',
  'lit-action-execution',
] as const);

/**
 * Type for a contract resolver instance which will be used
 * In place of LitContractContext for loading addresses of lit contracts
 * an instance of LitContractContext can still be provided. which will be used for abi data.
 *
 */
export const LitContractResolverContextSchema = z
  .object({
    resolverAddress: z.string(),
    abi: z.any(), // TODO: Define ABI type
    environment: z.number(),
    contractContext: LitContractContextSchema.optional(),
    provider: z.instanceof(ethers.providers.JsonRpcProvider).optional(),
  })
  .catchall(
    z.union([
      z.string(),
      LitContractContextSchema,
      z.instanceof(ethers.providers.JsonRpcProvider),
      z.undefined(),
      z.number(),
    ])
  );

export const LitAuthSigChainKeysSchema = z
  .enum(LIT_AUTH_SIG_CHAIN_KEYS)
  .readonly();
export type LIT_AUTH_SIG_CHAIN_KEYS_TYPE = z.infer<
  typeof LitAuthSigChainKeysSchema
>;

// Lit supported chains
export const LitBaseChainSchema = z
  .object({
    name: z.string(),
    symbol: z.string(),
    decimals: z.number(),
    rpcUrls: z.array(z.string()).nonempty().readonly(),
    blockExplorerUrls: z.array(z.string()).nonempty().readonly(),
  })
  .strict();

// EVM
export const LitEVMChainSchema = LitBaseChainSchema.extend({
  vmType: z.literal(VMTYPE.EVM),
  chainId: z.number(),
  contractAddress: z.union([z.string().optional(), z.null()]),
  type: z.union([z.string().optional(), z.null()]),
  extra: z.boolean().optional(), // TODO Check if we need this
})
  .strict()
  .readonly();

// Solana
export const LitSVMChainSchema = LitBaseChainSchema.extend({
  vmType: z.literal(VMTYPE.SVM),
})
  .strict()
  .readonly();

// Cosmos
export const LitCosmosChainSchema = LitBaseChainSchema.extend({
  vmType: z.literal(VMTYPE.CVM),
  chainId: z.string(),
})
  .strict()
  .readonly();

export const LitEVMChainsSchema = z.record(z.string(), LitEVMChainSchema);
export const LitSVMChainsSchema = z.record(z.string(), LitSVMChainSchema);
export const LitCosmosChainsSchema = z.record(z.string(), LitCosmosChainSchema);
export const AllLitChainsSchema = z.record(
  z.string(),
  z.union([LitEVMChainSchema, LitSVMChainSchema, LitCosmosChainSchema])
);

export const AuthSigSchema = z.object({
  /**
   * The signature produced by signing the `signMessage` property with the corresponding private key for the `address` property.
   */
  sig: z.string(), // TODO it was any?
  /**
   * The method used to derive the signature (e.g, `web3.eth.personal.sign`).
   */
  derivedVia: z.string(),
  /**
   * An [ERC-5573](https://eips.ethereum.org/EIPS/eip-5573) SIWE (Sign-In with Ethereum) message. This can be prepared by using one of the `createSiweMessage` functions from the [`@auth-helpers`](https://v6-api-doc-lit-js-sdk.vercel.app/modules/auth_helpers_src.html) package:
   * -  [`createSiweMessage`](https://v6-api-doc-lit-js-sdk.vercel.app/functions/auth_helpers_src.createSiweMessage.html)
   * -  [`createSiweMessageWithRecaps](https://v6-api-doc-lit-js-sdk.vercel.app/functions/auth_helpers_src.createSiweMessageWithRecaps.html)
   * -  [`createSiweMessageWithCapacityDelegation`](https://v6-api-doc-lit-js-sdk.vercel.app/functions/auth_helpers_src.createSiweMessageWithCapacityDelegation.html)
   */
  signedMessage: z.string(),
  /**
   * The Ethereum address that was used to sign `signedMessage` and create the `sig`.
   */
  address: z.string(),
  /**
   * An optional property only seen when generating session signatures, this is the signing algorithm used to generate session signatures.
   */
  algo: z.string().optional(),
});

/**
 * A map of node addresses to the session signature payload
 * for that node specifically.
 *
 * Each individual session signature for each node includes the following properties:
 * -  `sig`: The signature produced by the ECDSA key pair signing the `signedMessage` payload.
 *
 * -  `derivedVia`: Should be `litSessionSignViaNacl`, specifies that the session signature object was created via the `NaCl` library.
 *
 * -  `signedMessage`: The payload signed by the session key pair. This is the signed `AuthSig` with the contents of the AuthSig's `signedMessage` property being derived from the [`authNeededCallback`](https://v6-api-doc-lit-js-sdk.vercel.app/interfaces/types_src.GetSessionSigsProps.html#authNeededCallback) property.
 *
 * -  `address`: When the session key signs the SIWE ReCap message, this will be the session key pair public key. If an EOA wallet signs the message, then this will be the EOA Ethereum address.
 *
 * -  `algo`: The signing algorithm used to generate the session signature.
 */
export const SessionSigsSchema = z.record(z.string(), AuthSigSchema);

// pub struct AuthMethod {
//     pub auth_method_type: u32,
//     pub access_token: String,
// }
export const AuthMethodSchema = z.object({
  authMethodType: z.number(),
  accessToken: z.string(),
});

export const ParsedSignedMessageSchema = z
  .object({
    // Known keys
    URI: z.string().optional(),
    Version: z.string().optional(),
    'Chain ID': z.string().optional(),
    Nonce: z.string().optional(),
    'Issued At': z.string().optional(),

    /**
     * Inner expiration
     */
    'Expiration Time': z.string().optional(),
    Resources: z.array(z.string()).optional(),

    /**
     * Outer expiration
     */
    expiration: z.string().optional(),
  })
  .catchall(z.unknown()); // Dynamic keys

export const CapabilitySchema = AuthSigSchema.extend({
  parsedSignedMessage: ParsedSignedMessageSchema.optional(),
});

export const ParsedSessionMessageSchema = ParsedSignedMessageSchema.extend({
  capabilities: z.array(CapabilitySchema).nonempty(),
});

export const CosmosWalletTypeSchema = z.enum(['keplr', 'leap'] as const);

export const SessionKeyPairSchema = z.object({
  publicKey: z.string(),
  secretKey: z.string(),
});

export const LitActionSdkParamsSchema = z.object({
  /**
   * The litActionCode is the JavaScript code that will run on the nodes.
   * You will need to convert the string content to base64.
   *
   * @example
   * Buffer.from(litActionCodeString).toString('base64');
   */
  litActionCode: z.string().optional(),
  /**
   * You can obtain the Lit Action IPFS CID by converting your JavaScript code using this tool:
   * https://explorer.litprotocol.com/create-action
   *
   * Note: You do not need to pin your code to IPFS necessarily.
   * You can convert a code string to an IPFS hash using the "ipfs-hash-only" or 'ipfs-unixfs-importer' library.
   *
   * @example
   * async function stringToIpfsHash(input: string): Promise<string> {
   *   // Convert the input string to a Buffer
   *   const content = Buffer.from(input);
   *
   *   // Import the content to create an IPFS file
   *   const files = importer([{ content }], {} as any, { onlyHash: true });
   *
   *   // Get the first (and only) file result
   *   const result = (await files.next()).value;
   *
   *   const ipfsHash = (result as any).cid.toString();
   *   if (!ipfsHash.startsWith('Qm')) {
   *     throw new Error('Generated hash does not start with Qm');
   *   }
   *
   *   return ipfsHash;
   * }
   */
  litActionIpfsId: z.string().optional(),
  /**
   * An object that contains params to expose to the Lit Action.  These will be injected to the JS runtime before your code runs, so you can use any of these as normal variables in your Lit Action.
   */
  jsParams: z
    .union([
      z.any(),
      z
        .object({
          publicKey: z.string().optional(),
          sigName: z.string().optional(),
        })
        .catchall(z.any()),
    ])
    .optional(),
});

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

export const StorageProviderSchema = z.object({
  provider: z.object({
    getItem: z
      .function()
      .args(z.string())
      .returns(z.union([z.string(), z.null()])),
    setItem: z.function().args(z.string(), z.string()).returns(z.void()),
    removeItem: z.function().args(z.string()).returns(z.void()),
    clear: z.function().returns(z.void()),
  }),
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

export const CustomNetworkSchema = z.intersection(
  LitNodeClientConfigSchema.pick({
    litNetwork: true,
    contractContext: true,
    checkNodeAttestation: true,
  }),
  LitNodeClientConfigSchema.pick({ minNodeCount: true }).partial()
);

export const DerivedAddressesSchema = z.object({
  publicKey: z.string(),
  publicKeyBuffer: z.instanceof(Buffer),
  ethAddress: z.string(),
  btcAddress: z.string(),
  cosmosAddress: z.string(),
  isNewPKP: z.boolean(),
});

export const TokenInfoSchema = DerivedAddressesSchema.extend({
  tokenId: z.string(),
});

/**
 * from the `getActiveUnkickedValidatorStructsAndCounts` Staking contract function
 epochLength: _BigNumber { _hex: '0x05dc', _isBigNumber: true },
 number: _BigNumber { _hex: '0x04c5', _isBigNumber: true },
 endTime: _BigNumber { _hex: '0x66c75b12', _isBigNumber: true },
 retries: _BigNumber { _hex: '0x03', _isBigNumber: true },
 timeout: _BigNumber { _hex: '0x3c', _isBigNumber: true }
 */
export const EpochInfoSchema = z
  .object({
    epochLength: z.number(),
    number: z.number(),
    endTime: z.number(),
    retries: z.number(),
    timeout: z.number(),
  })
  .strict();

export const JsonHandshakeResponseSchema = z.object({
  serverPubKey: z.string(),
  subnetPubKey: z.string(),
  networkPubKey: z.string(),
  networkPubKeySet: z.string(),
  hdRootPubkeys: z.array(z.string()),
  latestBlockhash: z.string().optional(),
});

export const EncryptResponseSchema = z.object({
  /**
   * The base64-encoded ciphertext
   */
  ciphertext: z.string(),
  /**
   * The hash of the data that was encrypted
   */
  dataToEncryptHash: z.string(),
});

export const BlsSignatureShareSchema = z.object({
  ProofOfPossession: z.string(),
});

export const NodeBlsSigningShareSchema = z.object({
  shareIndex: z.number(), // any(),
  unsignedJwt: z.string().optional(), // any(),
  signatureShare: BlsSignatureShareSchema,
  response: z.any(), // TODO
  logs: z.string().optional(), // any(),
});

export const AccessControlConditionsSchema = z.array(z.any()); // TODO AccessControlConditions
export const EvmContractConditionsSchema = z.array(z.any()); // TODO EvmContractConditions
export const SolRpcConditionsSchema = z.array(z.any()); // TODO SolRpcConditions
export const UnifiedAccessControlConditionsSchema = z.array(z.any()); // TODO UnifiedAccessControlConditions

export const MultipleAccessControlConditionsSchema = z.object({
  // The access control conditions that the user must meet to obtain this signed token.  This could be possession of an NFT, for example.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
  accessControlConditions: AccessControlConditionsSchema.optional(),

  // EVM Smart Contract access control conditions that the user must meet to obtain this signed token.  This could be possession of an NFT, for example.  This is different than accessControlConditions because accessControlConditions only supports a limited number of contract calls.  evmContractConditions supports any contract call.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
  evmContractConditions: EvmContractConditionsSchema.optional(),

  // Solana RPC call conditions that the user must meet to obtain this signed token.  This could be possession of an NFT, for example.
  solRpcConditions: SolRpcConditionsSchema.optional(),

  // An array of unified access control conditions.  You may use AccessControlCondition, EVMContractCondition, or SolRpcCondition objects in this array, but make sure you add a conditionType for each one.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
  unifiedAccessControlConditions:
    UnifiedAccessControlConditionsSchema.optional(),
});

/**
 * Struct in rust
 * -----
 pub struct JsonSigningResourceId {
 pub base_url: String,
 pub path: String,
 pub org_id: String,
 pub role: String,
 pub extra_data: String,
 }
 */
export const JsonSigningResourceIdSchema = z.object({
  baseUrl: z.string(),
  path: z.string(),
  orgId: z.string(),
  role: z.string(),
  extraData: z.string(),
});

export const JsonAccsRequestSchema =
  MultipleAccessControlConditionsSchema.extend({
    // The chain name of the chain that you are querying.  See ALL_LIT_CHAINS for currently supported chains.
    chain: ChainSchema.optional(),

    // The resourceId representing something on the web via a URL
    resourceId: JsonSigningResourceIdSchema.optional(),

    // The authentication signature that proves that the user owns the crypto wallet address that meets the access control conditions
    authSig: AuthSigSchema.optional(),

    sessionSigs: SessionSigsSchema.optional(),
  });

/**
 * Struct in rust
 * -----
 pub struct JsonSigningRetrieveRequest {
 pub access_control_conditions: Option<Vec<AccessControlConditionItem>>,
 pub evm_contract_conditions: Option<Vec<EVMContractConditionItem>>,
 pub sol_rpc_conditions: Option<Vec<SolRpcConditionItem>>,
 pub unified_access_control_conditions: Option<Vec<UnifiedAccessControlConditionItem>>,
 pub chain: Option<String>,
 pub resource_id: JsonSigningResourceId,
 pub auth_sig: AuthSigItem,
 pub iat: u64,
 pub exp: u64,
 }
 */
export const JsonSigningRetrieveRequestSchema = JsonAccsRequestSchema.extend({
  iat: z.number().optional(),
  exp: z.number().optional(),
  sessionSigs: z.any().optional(),
});

/**
 * Struct in rust
 * -----
 pub struct JsonEncryptionRetrieveRequest {
 pub access_control_conditions: Option<Vec<AccessControlConditionItem>>,
 pub evm_contract_conditions: Option<Vec<EVMContractConditionItem>>,
 pub sol_rpc_conditions: Option<Vec<SolRpcConditionItem>>,
 pub unified_access_control_conditions: Option<Vec<UnifiedAccessControlConditionItem>>,
 pub chain: Option<String>,
 pub to_decrypt: String,
 pub auth_sig: AuthSigItem,
 }
 */
export const JsonEncryptionRetrieveRequestSchema = JsonAccsRequestSchema.extend(
  {
    // The ciphertext that you wish to decrypt encoded as a hex string
    toDecrypt: z.string(),
  }
);

export const SupportedJsonRequestsSchema =
  JsonSigningRetrieveRequestSchema.merge(
    JsonEncryptionRetrieveRequestSchema
  ).extend({});

export const FormattedMultipleAccsSchema = z.object({
  error: z.boolean(),
  formattedAccessControlConditions: z.any(), // TODO
  formattedEVMContractConditions: z.any(), // TODO
  formattedSolRpcConditions: z.any(), // TODO
  formattedUnifiedAccessControlConditions: z.any(), // TODO
});

export const NodeErrorV1Schema = z.object({
  errorKind: z.string(),
  status: z.number(),
  details: z.array(z.string()),
  message: z.string().optional(),
  errorCode: z.string().optional(),
});

export const RejectedNodePromisesSchema = z.object({
  success: z.literal(false),
  error: NodeErrorV1Schema,
});

export const SendNodeCommandSchema = z.object({
  url: z.string(),
  data: z.any(),
  requestId: z.string(),
});

export const AttenuationsObjectSchema = z.record(
  z.string(),
  z.record(z.string(), z.array(JsonSchema))
);

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

export const HandshakeWithNodeSchema = z.object({
  url: z.string(),
  challenge: z.string(),
});

export const NodeAttestationSchema = z.object({
  type: z.string(),
  noonce: z.string(),
  data: z.object({
    INSTANCE_ID: z.string(),
    RELEASE_ID: z.string(),
    UNIX_TIME: z.string(),
  }),
  signatures: z.array(z.string()),
  report: z.string(),
});

export const NodeCommandServerKeysResponseSchema = z.object({
  serverPublicKey: z.string(),
  subnetPublicKey: z.string(),
  networkPublicKey: z.string(),
  networkPublicKeySet: z.string(),
  hdRootPubkeys: z.array(z.string()),
  attestation: NodeAttestationSchema,
  latestBlockhash: z.string().optional(),
});

export const ResponseStrategySchema = z.enum([
  'leastCommon',
  'mostCommon',
  'custom',
]);

export const LitActionResponseStrategySchema = z.object({
  strategy: ResponseStrategySchema,
  customFilter: z
    .function()
    .args(z.array(z.record(z.string(), z.string())))
    .returns(z.record(z.string(), z.string()))
    .optional(),
});

export const IpfsOptionsSchema = z.object({
  overwriteCode: z.boolean().optional(),
  gatewayUrl: z.string().startsWith('https://').endsWith('/ipfs/').optional(),
});

export const ExecuteJsAdvancedOptionsSchema = z.object({
  /**
   * a strategy for processing `response` objects returned from the
   * Lit Action execution context
   */
  responseStrategy: LitActionResponseStrategySchema.optional(),
  /**
   * Allow overriding the default `code` property in the `JsonExecutionSdkParams`
   */
  ipfsOptions: IpfsOptionsSchema.optional(),
  /**
   * Only run the action on a single node; this will only work if all code in your action is non-interactive
   */
  useSingleNode: z.boolean().optional(),
});

export const JsonExecutionSdkParamsSchema = LitActionSdkParamsSchema.pick({
  jsParams: true,
})
  .merge(ExecuteJsAdvancedOptionsSchema)
  .extend({
    /**
     *  JS code to run on the nodes
     */
    code: z.string().optional(), // TODO one or the other
    /**
     * The IPFS ID of some JS code to run on the nodes
     */
    ipfsId: z.string().optional(), // TODO one or the other
    /**
     * the session signatures to use to authorize the user with the nodes
     */
    sessionSigs: SessionSigsSchema,
    /**
     * auth methods to resolve
     */
    authMethods: z.array(AuthMethodSchema).optional(),
  });

export const SigResponseSchema = z.object({
  r: z.string(),
  s: z.string(),
  recid: z.number(),
  signature: z.string().startsWith('0x'), // 0x...
  publicKey: z.string(), // pkp public key (no 0x prefix)
  dataSigned: z.string(),
});

export const ExecuteJsResponseBaseSchema = z.object({
  signatures: z.union([
    z.object({ sig: SigResponseSchema }),
    z.any(), // TODO
  ]),
});

export const SignatureSchema = z.object({
  r: z.string(),
  s: z.string(),
  v: z.number(),
});

export const NodeResponseSchema = z.object({
  response: z.any(), // TODO
});

export const NodeLogSchema = z.object({
  logs: z.any(), // TODO
});

export const ExecuteJsResponseSchema = ExecuteJsResponseBaseSchema.extend({
  success: z.boolean().optional(),
  response: z.union([z.string(), z.object({})]),
  logs: z.string(),
  claims: z
    .record(
      z.string(),
      z.object({
        signatures: z.array(SignatureSchema),
        derivedKeyId: z.string(),
      })
    )
    .optional(),
  debug: z
    .object({
      allNodeResponses: z.array(NodeResponseSchema),
      allNodeLogs: z.array(NodeLogSchema),
      rawNodeHTTPResponses: z.any(),
    })
    .optional(),
});

// pub struct SigningAccessControlConditionRequest {
//     pub access_control_conditions: Option<Vec<AccessControlConditionItem>>,
//     pub evm_contract_conditions: Option<Vec<EVMContractConditionItem>>,
//     pub sol_rpc_conditions: Option<Vec<SolRpcConditionItem>>,
//     pub unified_access_control_conditions: Option<Vec<UnifiedAccessControlConditionItem>>,
//     pub chain: Option<String>,
//     pub auth_sig: AuthSigItem,
//     pub iat: u64,
//     pub exp: u64,
//     #[serde(default = "default_epoch")]
//     pub epoch: u64,
// }
export const SigningAccessControlConditionRequestSchema =
  MultipleAccessControlConditionsSchema.extend({
    // The chain name of the chain that you are querying.  See ALL_LIT_CHAINS for currently supported chains.
    chain: z.string().optional(),

    // The authentication signature that proves that the user owns the crypto wallet address that meets the access control conditions
    authSig: AuthSigSchema.optional(),

    iat: z.number().optional(),
    exp: z.number().optional(),
  });

export const GetSignedTokenRequestSchema =
  SigningAccessControlConditionRequestSchema.extend({
    sessionSigs: SessionSigsSchema,
  });

export const EncryptSdkParamsSchema =
  MultipleAccessControlConditionsSchema.extend({
    dataToEncrypt: z.instanceof(Uint8Array),
  });

/**
 * This interface is mainly used for access control conditions & decrypt requests.
 * For signing operations such as executeJs and pkpSign, only sessionSigs is used.
 */
export const SessionSigsOrAuthSigSchema = z.object({
  // TODO pretty sure this has to be one OR the other but at least one is required
  /**
   * the session signatures to use to authorize the user with the nodes
   */
  sessionSigs: SessionSigsSchema.optional(),
  /**
   * This is a bare authSig generated client side by the user. It can only be used for access control conditions/encrypt/decrypt operations. It CANNOT be used for signing operation.
   */
  authSig: AuthSigSchema.optional(),
});

export const DecryptRequestBaseSchema = SessionSigsOrAuthSigSchema.merge(
  MultipleAccessControlConditionsSchema
).extend({
  /**
   * The chain name of the chain that this contract is deployed on.  See LIT_CHAINS for currently supported chains.
   */
  chain: ChainSchema,
});

export const DecryptRequestSchema = EncryptResponseSchema.merge(
  DecryptRequestBaseSchema
).extend({});

export const DecryptResponseSchema = z.object({
  // The decrypted data as a Uint8Array
  decryptedData: z.instanceof(Uint8Array),
});

export const SuccessNodePromisesSchema = z.object({
  success: z.literal(true),
  values: z.array(z.any()), // TODO add back generics
});

export const ILitNodeClientSchema = z.object({
  config: LitNodeClientConfigSchema,
  connectedNodes: z.set(z.string()),
  serverKeys: z.record(z.string(), JsonHandshakeResponseSchema),
  ready: z.boolean(),
  subnetPubKey: z.string().nullable(),
  networkPubKey: z.string().nullable(),
  networkPubKeySet: z.string().nullable(),
  latestBlockhash: z.string().nullable(),

  // ========== Constructor ==========
  // ** IMPORTANT !! You have to create your constructor when implementing this class **
  // constructor: z.function().args(z.union([LitNodeClientConfigSchema, CustomNetworkSchema])),

  // ========== Scoped Class Helpers ==========

  /**
   *
   * Set bootstrapUrls to match the network litNetwork unless it's set to custom
   *
   * @returns { void }
   *
   */
  setCustomBootstrapUrls: z.function().returns(z.void()),
  /**
   *
   * we need to send jwt params iat (issued at) and exp (expiration) because the nodes may have different wall clock times, the nodes will verify that these params are withing a grace period
   *
   */
  getJWTParams: z.function().returns(
    z.object({
      iat: z.number(),
      exp: z.number(),
    })
  ),
  /**
   *
   * Combine Shares from signature shares
   * @returns { string } final JWT (convert the sig to base64 and append to the jwt)
   *
   */
  combineSharesAndGetJWT: z
    .function()
    .args(z.array(NodeBlsSigningShareSchema), z.string().optional())
    .returns(z.promise(z.string())),
  /**
   *
   * Get different formats of access control conditions, eg. evm, sol, unified etc.
   *
   * @param { SupportedJsonRequests } params
   *
   * @returns { FormattedMultipleAccs }
   *
   */
  getFormattedAccessControlConditions: z
    .function()
    .args(SupportedJsonRequestsSchema)
    .returns(FormattedMultipleAccsSchema),
  /**
   *
   * Get hash of access control conditions
   *
   * @param { MultipleAccessControlConditions } params
   *
   * @returns { Promise<ArrayBuffer | undefined> }
   *
   */
  getHashedAccessControlConditions: z
    .function()
    .args(MultipleAccessControlConditionsSchema)
    .returns(z.promise(z.union([z.instanceof(ArrayBuffer), z.undefined()]))),

  // ========== Promise Handlers ==========

  /**
   *
   * Get and gather node promises
   *
   * @param { any } callback
   *
   * @returns { Array<Promise<any>> }
   *
   */
  getNodePromises: z
    .function()
    .args(z.function().args(z.string()).returns(z.promise(z.any()))) // TODO improve
    .returns(z.array(z.promise(z.any()))), // TODO
  /**
   * Handle node promises
   *
   * @param { Array<Promise<T>> } nodePromises
   *
   * @param {string} requestId request Id used for logging
   * @param {number} minNodeCount The minimum number of nodes we need a successful response from to continue
   * @returns { Promise<SuccessNodePromises<T> | RejectedNodePromisesSchema> }
   *
   */
  handleNodePromises: z
    .function()
    .args(z.array(z.promise(z.any())), z.string(), z.number())
    .returns(
      z.promise(
        z.discriminatedUnion('success', [
          SuccessNodePromisesSchema,
          RejectedNodePromisesSchema,
        ])
      )
    ),
  /**
   *
   * Throw node error
   *
   * @param { RejectedNodePromisesSchema } res
   * @param { string } requestId
   *
   * @returns { void }
   *
   */
  _throwNodeError: z
    .function()
    .args(RejectedNodePromisesSchema, z.string())
    .returns(z.never()),

  // ========== API Calls to Nodes ==========
  sendCommandToNode: z
    .function()
    .args(SendNodeCommandSchema)
    .returns(z.promise(z.any())), // TODO
  /**
   *
   * Handshake with SGX
   *
   * @param { HandshakeWithNode } params
   *
   * @returns { Promise<NodeCommandServerKeysResponse> }
   *
   */
  handshakeWithNode: z
    .function()
    .args(HandshakeWithNodeSchema, z.string())
    .returns(z.promise(NodeCommandServerKeysResponseSchema)),

  // ========== Scoped Business Logics ==========
  /**
   *
   * Execute JS on the nodes and combine and return any resulting signatures
   *
   * @param { ExecuteJsRequest } params
   *
   * @returns { ExecuteJsResponse }
   *
   */
  executeJs: z
    .function()
    .args(JsonExecutionSdkParamsSchema)
    .returns(z.promise(z.union([ExecuteJsResponseSchema, z.undefined()]))),
  /**
   *
   * Request a signed JWT from the LIT network. Before calling this function, you must know the access control conditions for the item you wish to gain authorization for.
   *
   * @param { GetSignedTokenRequest } params
   *
   * @returns { Promise<string> } final JWT
   *
   */
  getSignedToken: z
    .function()
    .args(GetSignedTokenRequestSchema)
    .returns(z.promise(z.union([z.string(), z.undefined()]))),
  /**
   * Encrypt data with Lit identity-based Timelock Encryption.
   *
   * @param params
   */
  encrypt: z
    .function()
    .args(EncryptSdkParamsSchema)
    .returns(z.promise(EncryptResponseSchema)),
  /**
   * Decrypt data with Lit identity-based Timelock Encryption.
   *
   * @param params
   */
  decrypt: z
    .function()
    .args(DecryptRequestSchema)
    .returns(z.promise(DecryptResponseSchema)),
  /**
   *
   * Connect to the LIT nodes
   *
   * @returns { Promise } A promise that resolves when the nodes are connected.
   *
   */
  connect: z.function().returns(z.promise(z.any())), // TODO
  /**
   * Generates a session capability object
   *
   * @param litResources An array of ILitResource to be processed.
   * @returns A Promise resolving to an ISessionCapabilityObject.
   */
  generateSessionCapabilityObjectWithWildcards: z
    .function()
    .args(z.array(ILitResourceSchema))
    .returns(z.promise(ISessionCapabilityObjectSchema)),
});
