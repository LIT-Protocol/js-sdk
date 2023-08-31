import { AuthMethodType } from './enums';
import * as ethers from 'ethers';
import {
  AuthMethod,
  LitRelayConfig,
  SignInWithOTPParams,
  Signature,
  StytchOtpProviderOptions,
  WebAuthnProviderOptions,
} from './interfaces';
import {
  AccsCOSMOSParams,
  AccsDefaultParams,
  AccsEVMParams,
  AccsOperatorParams,
  AccsRegularParams,
  AccsSOLV2Params,
  EthWalletProviderOptions,
  JsonEncryptionRetrieveRequest,
  JsonExecutionRequest,
  JsonSignChainDataRequest,
  JsonSigningRetrieveRequest,
  OAuthProviderOptions,
  BaseAuthenticateOptions,
} from './interfaces';

export type AccessControlConditions = AccsRegularParams[] | AccsDefaultParams[];

export type EvmContractConditions = AccsEVMParams[];
export type SolRpcConditions = AccsSOLV2Params[];
export type UnifiedAccessControlConditions = (
  | AccsRegularParams
  | AccsDefaultParams
  | AccsEVMParams
  | AccsSOLV2Params
  | AccsCOSMOSParams
  | AccsOperatorParams
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
export type LITChainRequiredProps = {
  name: string;
  symbol: string;
  decimals: number;
  rpcUrls: Array<string>;
  blockExplorerUrls: Array<string>;
  vmType: string;
};

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
export type LITChain<T> = {
  [chainName: string]: T;
};

export type LIT_NETWORKS_KEYS = 'cayenne' | 'localhost' | 'custom';

export type ConditionType = 'solRpc' | 'evmBasic' | 'evmContract' | 'cosmos';

// union type for all the different types of conditions
export type ConditionItem =
  | AccsOperatorParams
  | AccsRegularParams
  | AccsDefaultParams
  | AccsSOLV2Params;

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
 * Callback for processing claim requests.
 * Processing can be done either by a relay server or a contract client
 * for a drop in client the `contract-sdk` or  your own contract client with correct ABI's and contract addresses.
 */
export type MintCallback<T = ClaimProcessor> = (
  response: ClaimResult<T>
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
  mintCallback?: MintCallback<T>, 
} & (T extends 'relay' ? LitRelayConfig : {signer: ethers.Signer});

/**
 * Result from network claim proccessing, used in {@link MintCallback}
 */
export type ClaimResult<T = ClaimProcessor> = {
  signatures: Signature[],
  derivedKeyId: string,
  authMethodType: AuthMethodType
  pubkey: string, 
} & (T extends 'relay' ? LitRelayConfig : {signer: ethers.Signer});