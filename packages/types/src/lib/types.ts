import * as ethers from 'ethers';

import {
  LPACC_EVM_ATOM,
  LPACC_EVM_CONTRACT,
  LPACC_SOL,
  LPACC_EVM_BASIC,
} from '@lit-protocol/accs-schemas';

import { AuthMethodType } from './enums';
import {
  AuthMethod,
  LitRelayConfig,
  SignInWithOTPParams,
  Signature,
  StytchOtpProviderOptions,
  WebAuthnProviderOptions,
  AccsOperatorParams,
  EthWalletProviderOptions,
  JsonEncryptionRetrieveRequest,
  JsonExecutionRequest,
  JsonSignChainDataRequest,
  JsonSigningRetrieveRequest,
  OAuthProviderOptions,
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

export type Chain = string;

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
  rpcUrls: string[];
  blockExplorerUrls: string[];
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

export type LIT_NETWORKS_KEYS =
  | 'cayenne'
  | 'localhost'
  | 'custom'
  | 'habanero'
  | 'manzano';

export type SymmetricKey = Uint8Array | string | CryptoKey | BufferSource;
export type EncryptedSymmetricKey = string | Uint8Array | any;
export type AcceptedFileType = File | Blob;

/**
 * ========== Lit Auth Client ==========
 */
export type IRelayAuthStatus = 'InProgress' | 'Succeeded' | 'Failed';

export type ProviderOptions =
  | OAuthProviderOptions
  | EthWalletProviderOptions
  | SignInWithOTPParams
  | StytchOtpProviderOptions
  | WebAuthnProviderOptions;

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
  network: string
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
  authMethodType: AuthMethodType;
  pubkey: string;
} & (T extends 'relay' ? LitRelayConfig : { signer: ethers.Signer });

export interface LitContract {
  address?: string;
  abi?: any;
  name?: string;
}

/**
 * Defines a set of contract metadata for bootstrapping
 * network context and interfacing with contracts on Chroncile blockchain
 *
 */
export interface LitContractContext {
  [index: string]: string | any;

  Allowlist: LitContract;
  LITToken: LitContract;
  Multisender: LitContract;
  PKPHelper: LitContract;
  PKPNFT: LitContract;
  PKPNFTMetadata: LitContract;
  PKPPermissions: LitContract;
  PubkeyRouter: LitContract;
  RateLimitNFT: LitContract;
  Staking: LitContract;
  StakingBalances: LitContract;
}

/**
 * Type for a contract resolver instance which will be used
 * In place of LitContractContext for loading addresses of lit contracts
 * an instance of LitContractContext can still be provided. which will be used for abi data.
 *
 */
export interface LitContractResolverContext {
  [index: string]:
    | string
    | LitContractContext
    | ethers.providers.JsonRpcProvider
    | undefined
    | number;
  resolverAddress: string;
  abi: any;
  environment: number;
  contractContext?: LitContractContext;
  provider?: ethers.providers.JsonRpcProvider;
}

export type ResponseStrategy = 'leastCommon' | 'mostCommon' | 'custom';
