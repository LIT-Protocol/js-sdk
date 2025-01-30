import * as ethers from 'ethers';

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
  | 'datil-dev'
  | 'datil-test'
  | 'datil'
  | 'naga-dev'
  | 'custom';

export type SymmetricKey = Uint8Array | string | CryptoKey | BufferSource;
export type AcceptedFileType = File | Blob;

/**
 * ========== Lit Auth Client ==========
 */
export type IRelayAuthStatus = 'InProgress' | 'Succeeded' | 'Failed';

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
 * Result from network claim processing, used in {@link MintCallback}
 */
export type ClaimResult<T = ClaimProcessor> = {
  signatures: Signature[];
  derivedKeyId: string;
  authMethodType: number;
  pubkey: string;
} & (T extends 'relay' ? LitRelayConfig : { signer: ethers.Signer });

export interface LitContract {
  address?: string;
  abi?: ethers.ContractInterface;
  name?: string;
}

/**
 * Defines a set of contract metadata for bootstrapping
 * network context and interfacing with contracts on Chronicle blockchain
 */
export interface ExclusiveLitContractContext {
  Allowlist: LitContract;
  LITToken: LitContract;
  Multisender: LitContract;
  PKPHelper: LitContract;
  PKPNFT: LitContract;
  PKPNFTMetadata: LitContract;
  PKPPermissions: LitContract;
  PubkeyRouter: LitContract;
  Staking: LitContract;
  PriceFeed: LitContract;
}
export interface LitContractContext extends ExclusiveLitContractContext {
  [index: string]: string | any;
}

export type ContractName = keyof ExclusiveLitContractContext;

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
    | ethers.ContractInterface
    | undefined
    | number;
  resolverAddress: string;
  abi: ethers.ContractInterface;
  environment: number;
  contractContext?: LitContractContext;
  provider?: ethers.providers.JsonRpcProvider;
}

export type ResponseStrategy = 'leastCommon' | 'mostCommon' | 'custom';

export type LitResourcePrefix =
  | 'lit-accesscontrolcondition'
  | 'lit-pkp'
  | 'lit-paymentdelegation'
  | 'lit-litaction';

export type LitAbility =
  | 'access-control-condition-decryption'
  | 'access-control-condition-signing'
  | 'pkp-signing'
  | 'lit-payment-delegation'
  | 'lit-action-execution';

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
export interface EpochInfo {
  epochLength: number;
  number: number;
  endTime: number;
  retries: number;
  timeout: number;
}
