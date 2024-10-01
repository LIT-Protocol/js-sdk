import * as ethers from 'ethers';
import { z } from 'zod';

import {
  LPACC_EVM_ATOM,
  LPACC_EVM_CONTRACT,
  LPACC_SOL,
  LPACC_EVM_BASIC,
} from '@lit-protocol/accs-schemas';

import {
  AuthMethod,
  LitRelayConfig,
  Signature,
  AccsOperatorParams,
  JsonEncryptionRetrieveRequest,
  JsonExecutionRequest,
  JsonSignChainDataRequest,
  JsonSigningRetrieveRequest,
  BaseAuthenticateOptions,
} from './interfaces';

export type ConditionType = 'solRpc' | 'evmBasic' | 'evmContract' | 'cosmos';

export type AccsDefaultParams = LPACC_EVM_BASIC;
export type AccsSOLV2Params = LPACC_SOL;
export type AccsEVMParams = LPACC_EVM_CONTRACT;
export type AccsCOSMOSParams = LPACC_EVM_ATOM;

// union type for all the different types of conditions
export type AccsParams =
  | AccsDefaultParams
  | AccsEVMParams
  | AccsSOLV2Params
  | AccsCOSMOSParams;

// union type for all the different types of conditions including operator
export type ConditionItem = AccsParams | AccsOperatorParams;

export type AccessControlConditions = (
  | AccsDefaultParams
  | AccsOperatorParams
  | AccessControlConditions
)[];
export type EvmContractConditions = (
  | AccsEVMParams
  | AccsOperatorParams
  | EvmContractConditions
)[];
export type SolRpcConditions = (
  | AccsSOLV2Params
  | AccsOperatorParams
  | SolRpcConditions
)[];
export type UnifiedAccessControlConditions = (
  | AccsParams
  | AccsOperatorParams
  | UnifiedAccessControlConditions
)[];

export type JsonRequest = JsonExecutionRequest | JsonSignChainDataRequest;

export type SupportedJsonRequests =
  | JsonSigningRetrieveRequest
  | JsonEncryptionRetrieveRequest;

export const ChainSchema = z.string();
export type Chain = z.infer<typeof ChainSchema>;

/**
 *
 * The default required properties of all chains
 *
 * @typedef { Object } LITChainRequiredProps
 */
export interface LITChainRequiredProps {
  name: string;
  symbol: string;
  decimals: number;
  rpcUrls: readonly string[];
  blockExplorerUrls: readonly string[];
  vmType: string;
}

/**
 * @typedef { Object } LITEVMChain
 * @property { string } contractAddress - The address of the token contract for the optional predeployed ERC1155 contract.  Only present on EVM chains.
 * @property { string } chainId - The chain ID of the chain that this token contract is deployed on.  Used for EVM chains.
 * @property { string } name - The human readable name of the chain
 */
export type LITEVMChain = LITChainRequiredProps & {
  contractAddress: string | null;
  chainId: number;
  type: string | null;
};

/**
 * @typedef { Object } LITSVMChain
 */
export type LITSVMChain = LITChainRequiredProps;

/**
 * @typedef { Object } LITCosmosChain
 * @property {string} chainId - The chain ID of the chain that this token contract is deployed on.  Used for Cosmos chains.
 */
export type LITCosmosChain = LITChainRequiredProps & {
  chainId: string;
};

/**
 * @typedef {Object} LITChain
 * @property {string} vmType - Either EVM for an Ethereum compatible chain or SVM for a Solana compatible chain
 * @property {string} name - The human readable name of the chain
 */
export type LITChain<T> = Record<string, T>;

export const LitNetworkKeysSchema = z.enum([
  'datil-dev',
  'datil-test',
  'datil',
  'custom',
] as const);
export type LIT_NETWORKS_KEYS = z.infer<typeof LitNetworkKeysSchema>;

export type SymmetricKey = Uint8Array | string | CryptoKey | BufferSource;
export type EncryptedSymmetricKey = string | Uint8Array | any;
export type AcceptedFileType = File | Blob;

/**
 * ========== Lit Auth Client ==========
 */
export type IRelayAuthStatus = 'InProgress' | 'Succeeded' | 'Failed';

export type AuthenticateOptions = BaseAuthenticateOptions;

/**
 * Type for expressing claim results being processed by a relay server
 */
export type RelayClaimProcessor = 'relay';

/**
 * Type for expressing claim results being processed by a local contract client
 * the `contract-sdk` is the intended use of this type
 */
export type ClientClaimProcessor = 'client';

/**
 * Type aggregate for Claim proccessor types
 */
export type ClaimProcessor = RelayClaimProcessor | ClientClaimProcessor;

/**
 * Callback function for processing claim requests.
 *
 * This function can be used in two scenarios:
 * 1. When the claim is processed by a relay server.
 * 2. When the claim is processed by a contract client.
 *
 * For contract clients, you can use the `contract-sdk` or implement your own client.
 * Ensure that your client has the correct ABI and contract addresses for successful processing.
 */
export type MintCallback<T = ClaimProcessor> = (
  response: ClaimResult<T>,
  network: LIT_NETWORKS_KEYS
) => Promise<string>;

/**
 * Model for requesting a PKP to be claimed based on an {@link AuthMethod} identifier
 * the {@link MintCallback} may be defined for custom processing of the {@link ClaimResult}
 * which requires registering on chain, by default chain registering will be done by an external relay.
 * @property {AuthMethod} authMethod to derive the key id from for claiming
 * @property {MintCallback} mintCallback optional callback for custom on chain registration behavior
 */
export type ClaimRequest<T = ClaimProcessor> = {
  authMethod: AuthMethod;
  mintCallback?: MintCallback<T>;
} & (T extends 'relay' ? LitRelayConfig : { signer: ethers.Signer });

/**
 * Result from network claim proccessing, used in {@link MintCallback}
 */
export type ClaimResult<T = ClaimProcessor> = {
  signatures: Signature[];
  derivedKeyId: string;
  authMethodType: number;
  pubkey: string;
} & (T extends 'relay' ? LitRelayConfig : { signer: ethers.Signer });

export const LitContractSchema = z.object({
  address: z.string().optional(),
  abi: z.any().optional(), // TODO: Define ABI type
  name: z.string().optional(),
});
export type LitContract = z.infer<typeof LitContractSchema>;

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
export type ExclusiveLitContractContext = z.infer<
  typeof ExclusiveLitContractContextSchema
>;
export const LitContractContextSchema =
  ExclusiveLitContractContextSchema.catchall(z.union([z.string(), z.any()]));
export type LitContractContext = z.infer<typeof LitContractContextSchema>;

export type ContractName = keyof ExclusiveLitContractContext;

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
export type LitContractResolverContext = z.infer<
  typeof LitContractResolverContextSchema
>;

export type ResponseStrategy = 'leastCommon' | 'mostCommon' | 'custom';

export const LitResourcePrefixSchema = z.enum([
  'lit-accesscontrolcondition',
  'lit-pkp',
  'lit-ratelimitincrease',
  'lit-litaction',
] as const);
export type LitResourcePrefix = z.infer<typeof LitResourcePrefixSchema>;

export const LitAbilitySchema = z.enum([
  'access-control-condition-decryption',
  'access-control-condition-signing',
  'pkp-signing',
  'rate-limit-increase-auth',
  'lit-action-execution',
] as const);
export type LitAbility = z.infer<typeof LitAbilitySchema>;

export interface TokenInfo {
  tokenId: string;
  publicKey: string;
  publicKeyBuffer: Buffer;
  ethAddress: string;
  btcAddress: string;
  cosmosAddress: string;
  isNewPKP: boolean;
}

/**
 * from the `getActiveUnkickedValidatorStructsAndCounts` Staking contract function
   epochLength: _BigNumber { _hex: '0x05dc', _isBigNumber: true },
  number: _BigNumber { _hex: '0x04c5', _isBigNumber: true },
  endTime: _BigNumber { _hex: '0x66c75b12', _isBigNumber: true },
  retries: _BigNumber { _hex: '0x03', _isBigNumber: true },
  timeout: _BigNumber { _hex: '0x3c', _isBigNumber: true }
 */
export type EpochInfo = {
  epochLength: number;
  number: number;
  endTime: number;
  retries: number;
  timeout: number;
};
