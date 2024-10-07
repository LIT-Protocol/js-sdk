import * as ethers from 'ethers';
import { z } from 'zod';

import { LIT_AUTH_SIG_CHAIN_KEYS, VMTYPE } from '@lit-protocol/constants';

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
