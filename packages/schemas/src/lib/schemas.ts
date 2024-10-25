import * as ethers from 'ethers';
import { z } from 'zod';

import { MultipleAccessControlConditionsSchema } from '@lit-protocol/access-control-conditions-schemas';
import { LIT_AUTH_SIG_CHAIN_KEYS, VMTYPE } from '@lit-protocol/constants';

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
export const JsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(JsonSchema), z.record(JsonSchema)])
);

export const ABIParamsSchema = z.object({
  name: z.string(),
  type: z.string(),
});

export const IProviderSchema = z.object({
  provider: z.any(),
  account: z.string(),
});

export const ChainSchema = z.string();

export const SignatureSchema = z.object({
  r: z.string(),
  s: z.string(),
  v: z.number(),
});

export const ClaimKeyResponseSchema = z.object({
  signatures: z.array(SignatureSchema),
  claimedKeyId: z.string(),
  pubkey: z.string(),
  mintTx: z.string(),
});

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

export const CapacityDelegationRequestSchema = z.object({
  nft_id: z.array(z.string()).optional(), // Optional array of strings
  delegate_to: z.array(z.string()).optional(), // Optional array of modified address strings
  uses: z.string().optional(),
});

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
  sig: z.string(),
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

export const SolanaAuthSigSchema = AuthSigSchema.extend({
  derivedVia: z.literal('solana.signMessage'),
});

export const CosmosAuthSigSchema = AuthSigSchema.extend({
  derivedVia: z.literal('cosmos.signArbitrary'),
});

export const SignSessionKeyResponseSchema = z.object({
  pkpPublicKey: z.string(),
  authSig: AuthSigSchema,
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
export const SessionSigsMapSchema = z.record(z.string(), AuthSigSchema);

// pub struct AuthMethod {
//     pub auth_method_type: u32,
//     pub access_token: String,
// }
export const AuthMethodSchema = z.object({
  authMethodType: z.number(),
  accessToken: z.string(),
});

export const SessionRequestBodySchema = z.object({
  sessionKey: z.string(),
  authMethods: z.array(AuthMethodSchema),
  pkpPublicKey: z.string().optional(),
  authSig: AuthSigSchema.optional(),
  siweMessage: z.string(),
});

export const CreateCustomAuthMethodRequestSchema = z.object({
  /**
   * For a custom authentication method, the custom auth ID should uniquely identify the user for that project. For example, for Google, we use appId:userId, so you should follow a similar format for Telegram, Twitter, or any other custom auth method.
   */
  authMethodId: z.union([z.string(), z.instanceof(Uint8Array)]),
  authMethodType: z.number(),
  /**
   * Permission scopes:
   * https://developer.litprotocol.com/v3/sdk/wallets/auth-methods/#auth-method-scopes
   */
  scopes: z.union([z.array(z.string()), z.array(z.number())]),
});

export const BaseJsonPkpSignRequestSchema = z.object({
  authMethods: z.array(AuthMethodSchema).optional(),
  toSign: z.instanceof(Uint8Array),
});

/**
 * The 'pkpSign' function param. Please note that the structure
 * is different than the payload sent to the node.
 */
export const JsonPkpSignSdkParamsSchema = BaseJsonPkpSignRequestSchema.extend({
  pubKey: z.string(),
  sessionSigs: SessionSigsMapSchema,
});

/**
 * The actual payload structure sent to the node /pkp/sign endpoint.
 */
export const JsonPkpSignRequestSchema = BaseJsonPkpSignRequestSchema.extend({
  // Nodes can sign number[], not Uint8Array. Must use normalizeArray function
  toSign: z.array(z.number()),

  authSig: AuthSigSchema,

  /**
   * note that 'key' is in lower case, because this is what the node expects
   */
  pubkey: z.string(),
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

export const BlsSignatureShareSchema = z.object({
  ProofOfPossession: z.string(),
});

export const NodeBlsSigningShareSchema = z.object({
  shareIndex: z.number(),
  unsignedJwt: z.string().optional(),
  signatureShare: BlsSignatureShareSchema,
  response: z.any().optional(), // TODO this depends on the type of operation that nodes do
  logs: z.string().optional(),
});

export const SigningAccessControlConditionJWTPayloadSchema =
  MultipleAccessControlConditionsSchema.extend({
    iss: z.string(),
    sub: z.string(),
    chain: ChainSchema.optional(),
    iat: z.number(),
    exp: z.number(),
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

    sessionSigs: SessionSigsMapSchema.optional(),
  });

export const GetSigningShareForDecryptionRequestSchema =
  JsonAccsRequestSchema.extend({
    dataToEncryptHash: z.string(),
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

const JsonExecutionSdkParamsBaseSchema = LitActionSdkParamsSchema.pick({
  jsParams: true,
})
  .merge(ExecuteJsAdvancedOptionsSchema)
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
     * the session signatures to use to authorize the user with the nodes
     */
    sessionSigs: SessionSigsMapSchema,
    /**
     * auth methods to resolve
     */
    authMethods: z.array(AuthMethodSchema).optional(),
  });
export const JsonExecutionSdkParamsSchema =
  JsonExecutionSdkParamsBaseSchema.refine(
    (data) => (data.code && !data.ipfsId) || (!data.code && data.ipfsId),
    {
      message: 'Either `code` or `ipfsId` must be provided, but not both.',
    }
  );

export const JsonExecutionSdkParamsTargetNodeSchema =
  JsonExecutionSdkParamsBaseSchema.extend({
    targetNodeRange: z.number(),
  }).refine(
    (data) => (data.code && !data.ipfsId) || (!data.code && data.ipfsId),
    {
      message: 'Either `code` or `ipfsId` must be provided, but not both.',
    }
  );

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

export const ExecuteJsNoSigningResponseSchema =
  ExecuteJsResponseBaseSchema.extend({
    claims: z.object({}), // TODO
    decryptions: z.array(z.any()).optional(), // TODO
    response: z.union([z.string(), z.object({})]),
    logs: z.string(),
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

export const EncryptSdkParamsSchema =
  MultipleAccessControlConditionsSchema.extend({
    dataToEncrypt: z.instanceof(Uint8Array),
  });

/**
 * These schemas are mainly used for access control conditions & decrypt requests.
 * For signing operations such as executeJs and pkpSign, only sessionSigs is used.
 */
export const SessionSigsAuthenticationSchema = z.object({
  /**
   * the session signatures to use to authorize the user with the nodes
   */
  sessionSigs: SessionSigsMapSchema,
});
export const AuthSigAuthenticationSchema = z.object({
  /**
   * This is a bare authSig generated client side by the user. It can only be used for access control conditions/encrypt/decrypt operations. It CANNOT be used for signing operation.
   */
  authSig: AuthSigSchema,
});
export const SessionSigsOrAuthSigSchema = z.union([
  SessionSigsAuthenticationSchema,
  AuthSigAuthenticationSchema,
]);

export const ChainedSchema = z.object({
  /**
   * The chain name of the chain that will be used. See LIT_CHAINS for currently supported chains.
   */
  chain: ChainSchema,
});

export const ChainedSessionSigsOrAuthSigSchema = z.union([
  SessionSigsAuthenticationSchema.merge(ChainedSchema.partial()),
  AuthSigAuthenticationSchema.merge(ChainedSchema.partial()),
]);

export const SuccessNodePromisesSchema = z.object({
  success: z.literal(true),
  values: z.array(z.any()), // TODO add back generics
});

/**
 * Struct in rust
 * -----
 pub struct JsonExecutionRequest {
 pub auth_sig: AuthSigItem,
 #[serde(default = "default_epoch")]
 pub epoch: u64,

 pub ipfs_id: Option<String>,
 pub code: Option<String>,
 pub js_params: Option<Value>,
 pub auth_methods: Option<Vec<AuthMethod>>,
 }
 */
export const JsonExecutionRequestSchema = LitActionSdkParamsSchema.pick({
  jsParams: true,
}).extend({
  authSig: AuthSigSchema,
  /**
   * auto-filled before sending each command to the node, but
   * in the rust struct, this type is required.
   */
  // epoch: z.string(),
  ipfsId: z.string().optional(),
  code: z.string().optional(),
  authMethods: z.array(AuthMethodSchema).optional(),
});

export const JsonExecytionRequestTargetNodeSchema =
  JsonExecutionRequestSchema.extend({
    targetNodeRange: z.number(),
  });

export const CallRequestSchema = z.object({
  // to - The address of the contract that will be queried
  to: z.string(),
  // The address calling the function.
  from: z.string().optional(),
  // Hex encoded data to send to the contract.
  data: z.string(),
});

/**
 * Struct in rust
 * -----
 pub struct JsonSignChainDataRequest {
 pub call_requests: Vec<web3::types::CallRequest>,
 pub chain: Chain,
 pub iat: u64,
 pub exp: u64,
 }
 */
export const JsonSignChainDataRequestSchema = z.object({
  callRequests: z.array(CallRequestSchema),
  chain: ChainSchema,
  iat: z.number(),
  exp: z.number(),
});

export const JsonRequestSchema = z.union([
  JsonExecutionRequestSchema,
  JsonSignChainDataRequestSchema,
]);

export const NodeCommandResponseSchema = z.object({
  url: z.string(),
  data: JsonRequestSchema,
});

export const JsonSignSessionKeyRequestV1Schema = LitActionSdkParamsSchema.pick({
  jsParams: true,
  litActionIpfsId: true,
}).extend({
  sessionKey: z.string(),
  authMethods: z.array(AuthMethodSchema),
  pkpPublicKey: z.string().optional(),
  siweMessage: z.string(),
  curveType: z.literal('BLS'),
  epoch: z.number().optional(),

  // custom auth params
  code: z.string().optional(),
});

// [
//   {
//     "result": "success",
//     "signatureShare": {
//       "ProofOfPossession": "01b191b1d281857a95d2fd189683db366ab1088723338c1805daa4650459e9fcaebaa57b58108c284d233404dd5f2e58f208aafb87d981098aba3fe850980184a4b29643a21107b03f1d928646245b57af3745a81418989e0b6aad9bd1f192723c"
//     },
//     "shareIndex": 0,
//     "curveType": "BLS",
//     "siweMessage": "litprotocol.com wants you to sign in with your Ethereum account:\n0x7f2e96c99F9551915DA9e9F828F512330f130acB\n\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\n\nURI: lit:session:73e09d1ad1faa329bef12ebaf9b982d2925746e3677cabd4b6b7196096a6ee02\nVersion: 1\nChain ID: 1\nNonce: 0xa5f18dbc0fa2080649042ab8cb6cef3b246c20c15b62482ba43fb4ca2a4642cb\nIssued At: 2024-04-25T02:09:35Z\nExpiration Time: 2024-04-26T02:09:50.822Z\nResources:\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1ZM3F1bjlxWDNmVUJIVmZyQTlmM3Y5UnB5eVBvOFJIRXVFTjFYWVBxMVByQSJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOlt7ImFwcElkIjoibGl0IiwiYXV0aE1ldGhvZFR5cGUiOjEsImV4cGlyYXRpb24iOjE3MTQwOTczODYsInVzZWRGb3JTaWduU2Vzc2lvbktleVJlcXVlc3QiOnRydWUsInVzZXJJZCI6IjB4NzA5OTc5NzBDNTE4MTJkYzNBMDEwQzdkMDFiNTBlMGQxN2RjNzlDOCJ9XSwiYXV0aFNpZ0FkZHJlc3MiOm51bGwsInJlc291cmNlcyI6W119fV19fSwicHJmIjpbXX0",
//     "dataSigned": "b2efe867176b9212fd6acd39a33004a17e03d5a931250c700e31af95e2e7e4d5",
//     "blsRootPubkey": "a6f7c284ac766db1b43f8c65d8ff15c7271a05b0863b5205d96459fd32aa353e9390ce0626560fb76720c1a5c8ca6902"
//   },
//   {
//     "result": "success",
//     "signatureShare": {
//       "ProofOfPossession": "038178034edcd5b48da4e2af6eb0891ece41389aa6119c80546d3fa00b5d2ba87eaec327b18d8013714b486246807498c8198e70cf8e917b1a5f1d8d0846787172521d41994de95bd641bdc1d9ccee9b459ceeb03f156cf357a4ff8faf5d2e167d"
//     },
//     "shareIndex": 2,
//     "curveType": "BLS",
//     "siweMessage": "litprotocol.com wants you to sign in with your Ethereum account:\n0x7f2e96c99F9551915DA9e9F828F512330f130acB\n\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\n\nURI: lit:session:73e09d1ad1faa329bef12ebaf9b982d2925746e3677cabd4b6b7196096a6ee02\nVersion: 1\nChain ID: 1\nNonce: 0xa5f18dbc0fa2080649042ab8cb6cef3b246c20c15b62482ba43fb4ca2a4642cb\nIssued At: 2024-04-25T02:09:35Z\nExpiration Time: 2024-04-26T02:09:50.822Z\nResources:\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1ZM3F1bjlxWDNmVUJIVmZyQTlmM3Y5UnB5eVBvOFJIRXVFTjFYWVBxMVByQSJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOlt7ImFwcElkIjoibGl0IiwiYXV0aE1ldGhvZFR5cGUiOjEsImV4cGlyYXRpb24iOjE3MTQwOTczODYsInVzZWRGb3JTaWduU2Vzc2lvbktleVJlcXVlc3QiOnRydWUsInVzZXJJZCI6IjB4NzA5OTc5NzBDNTE4MTJkYzNBMDEwQzdkMDFiNTBlMGQxN2RjNzlDOCJ9XSwiYXV0aFNpZ0FkZHJlc3MiOm51bGwsInJlc291cmNlcyI6W119fV19fSwicHJmIjpbXX0",
//     "dataSigned": "b2efe867176b9212fd6acd39a33004a17e03d5a931250c700e31af95e2e7e4d5",
//     "blsRootPubkey": "a6f7c284ac766db1b43f8c65d8ff15c7271a05b0863b5205d96459fd32aa353e9390ce0626560fb76720c1a5c8ca6902"
//   },
//   {
//     "result": "success",
//     "signatureShare": {
//       "ProofOfPossession": "0292a026325a166398b85b53f3a7a34d147c5337e189d75c33c0f227f7926c839b408dfcc5d242a8685a81c68e0ccedc080c051219161dbc37f06627259b19d15120ab2f710075a44b1dcef18d511bb99b6625c8f575d2688c6b5b01ba6bf448c9"
//     },
//     "shareIndex": 1,
//     "curveType": "BLS",
//     "siweMessage": "litprotocol.com wants you to sign in with your Ethereum account:\n0x7f2e96c99F9551915DA9e9F828F512330f130acB\n\nLit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'. (3) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.\n\nURI: lit:session:73e09d1ad1faa329bef12ebaf9b982d2925746e3677cabd4b6b7196096a6ee02\nVersion: 1\nChain ID: 1\nNonce: 0xa5f18dbc0fa2080649042ab8cb6cef3b246c20c15b62482ba43fb4ca2a4642cb\nIssued At: 2024-04-25T02:09:35Z\nExpiration Time: 2024-04-26T02:09:50.822Z\nResources:\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZHMiOlsiUW1ZM3F1bjlxWDNmVUJIVmZyQTlmM3Y5UnB5eVBvOFJIRXVFTjFYWVBxMVByQSJdLCJhdXRoTWV0aG9kQ29udGV4dHMiOlt7ImFwcElkIjoibGl0IiwiYXV0aE1ldGhvZFR5cGUiOjEsImV4cGlyYXRpb24iOjE3MTQwOTczODYsInVzZWRGb3JTaWduU2Vzc2lvbktleVJlcXVlc3QiOnRydWUsInVzZXJJZCI6IjB4NzA5OTc5NzBDNTE4MTJkYzNBMDEwQzdkMDFiNTBlMGQxN2RjNzlDOCJ9XSwiYXV0aFNpZ0FkZHJlc3MiOm51bGwsInJlc291cmNlcyI6W119fV19fSwicHJmIjpbXX0",
//     "dataSigned": "b2efe867176b9212fd6acd39a33004a17e03d5a931250c700e31af95e2e7e4d5",
//     "blsRootPubkey": "a6f7c284ac766db1b43f8c65d8ff15c7271a05b0863b5205d96459fd32aa353e9390ce0626560fb76720c1a5c8ca6902"
//   }
// ]
export const BlsResponseDataSchema = z.object({
  result: z.union([z.boolean(), z.literal('success')]),
  signatureShare: z.object({
    ProofOfPossession: z.string(),
  }),
  shareIndex: z.number(),
  curveType: z.string(),
  siweMessage: z.string(),
  dataSigned: z.string(),
  blsRootPubkey: z.string(),
});

/**
 * @deprecated
 * Struct in rust
 * -----
 pub struct JsonSigningStoreRequest {
 pub key: String,
 pub val: String,
 pub chain: Option<String>,
 pub permanant: Option<usize>,
 pub auth_sig: AuthSigItem,
 }
 */
export const JsonSigningStoreRequestSchema = z.object({
  key: z.string(),
  val: z.string(),
  chain: ChainSchema.optional(),
  permanant: z.union([z.literal(0), z.literal(1)]).optional(),
  permanent: z.union([z.literal(0), z.literal(1)]).optional(),
  authSsig: AuthSigSchema.optional(),
  sessionSigs: z.object({}).optional(),
});

export const PKPSignShareSchema = z.object({
  success: z.boolean(),
  signedData: z.any(), // TODO
  signatureShare: z.any(), // TODO
});

export const CombinedECDSASignatureSchema = z.object({
  r: z.string(),
  s: z.string(),
  recid: z.number(),
});
