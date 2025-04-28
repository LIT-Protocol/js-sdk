import { z } from 'zod';

import {
  LIT_AUTH_SIG_CHAIN_KEYS,
  LIT_ABILITY,
  LIT_CHAINS_KEYS,
  LIT_NETWORK,
  LIT_RESOURCE_PREFIX,
  VMTYPE,
} from '@lit-protocol/constants';

const definedLiteralSchema = z.union([z.string(), z.number(), z.boolean()]);
export type DefinedLiteral = z.infer<typeof definedLiteralSchema>;
export type DefinedJson =
  | DefinedLiteral
  | { [key: string]: DefinedJson }
  | DefinedJson[];
export const DefinedJsonSchema: z.ZodType<DefinedJson> = z.lazy(() =>
  z.union([
    definedLiteralSchema,
    z.array(DefinedJsonSchema),
    z.record(DefinedJsonSchema),
  ])
);

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
export type Literal = z.infer<typeof literalSchema>;
export type Json = Literal | { [key: string]: Json } | Json[];
export const JsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(JsonSchema), z.record(JsonSchema)])
);

export const HexSchema = z.string().regex(/^0x[0-9a-fA-F]+$/);
export const ChainSchema = z.string();
export const EvmChainSchema = z.enum(LIT_CHAINS_KEYS);

export const ChainedSchema = z.object({
  /**
   * The chain name of the chain that will be used. See LIT_CHAINS for currently supported chains.
   */
  chain: ChainSchema,
});

export const PricedSchema = z.object({
  userMaxPrice: z.bigint(),
});

export const LitNetworkKeysSchema = z.nativeEnum(LIT_NETWORK);

export const LitResourcePrefixSchema = z.nativeEnum(LIT_RESOURCE_PREFIX);

export const LitAbilitySchema = z.nativeEnum(LIT_ABILITY);

export const DerivedAddressesSchema = z.object({
  publicKey: z.string(),
  publicKeyBuffer: z.any(), // Buffer
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

export const LitAuthSigChainKeysSchema = z
  .enum(LIT_AUTH_SIG_CHAIN_KEYS)
  .readonly();

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
   * -  [`createSiweMessageWithResources](https://v6-api-doc-lit-js-sdk.vercel.app/functions/auth_helpers_src.createSiweMessageWithResources.html)
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

// pub struct AuthMethod {
//     pub auth_method_type: u32,
//     pub access_token: String,
// }
export const AuthMethodSchema = z.object({
  authMethodType: z.number(),
  accessToken: z.string(),
});

// TODO make it forcefully have litActionCode OR litActionIpfsId, one and only one of them MUST be provided
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
      z.any(), // TODO what happens if jsParams is a string/number/primitive?
      z
        .object({
          publicKey: z.string().optional(),
          sigName: z.string().optional(),
        })
        .catchall(z.any()),
    ])
    .optional(),
});

export const CosmosWalletTypeSchema = z.enum(['keplr', 'leap'] as const);

export const SessionKeyPairSchema = z.object({
  publicKey: z.string(),
  secretKey: z.string(),
});

export const AttenuationsObjectSchema = z.record(
  z.string(),
  z.record(z.string(), z.array(DefinedJsonSchema))
);
