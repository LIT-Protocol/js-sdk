import * as ethers from 'ethers';
import { z } from 'zod';

import {
  type AtomAcc,
  type EvmBasicAcc,
  type EvmContractAcc,
  type OperatorAcc,
  type SolAcc,
} from '@lit-protocol/access-control-conditions-schemas';
import {
  AllLitChainsSchema,
  ChainSchema,
  ExclusiveLitContractContextSchema,
  LitAbilitySchema,
  LitBaseChainSchema,
  LitContractContextSchema,
  LitContractResolverContextSchema,
  LitResourcePrefixSchema,
  LitContractSchema,
  LitEVMChainSchema,
  LitEVMChainsSchema,
  LitSVMChainSchema,
  LitSVMChainsSchema,
  LitCosmosChainSchema,
  LitCosmosChainsSchema,
  LitNetworkKeysSchema,
  EpochInfoSchema,
  TokenInfoSchema,
  DerivedAddressesSchema,
  ResponseStrategySchema,
} from '@lit-protocol/schemas';

import {
  AuthMethod,
  LitRelayConfig,
  Signature,
  JsonEncryptionRetrieveRequest,
  JsonExecutionRequest,
  JsonSignChainDataRequest,
  JsonSigningRetrieveRequest,
  BaseAuthenticateOptions,
} from './interfaces';

export type ConditionType = 'solRpc' | 'evmBasic' | 'evmContract' | 'cosmos';

// Backwards compatibility with @lit-protocol/accs-schemas
export type AccsDefaultParams = EvmBasicAcc;
export type AccsSOLV2Params = SolAcc;
export type AccsEVMParams = EvmContractAcc;
export type AccsCOSMOSParams = AtomAcc;

// union type for all the different types of conditions
export type AccsParams =
  | AccsDefaultParams
  | AccsEVMParams
  | AccsSOLV2Params
  | AccsCOSMOSParams;

// union type for all the different types of conditions including operator
export type ConditionItem = AccsParams | OperatorAcc;

export type AccessControlConditions = (
  | AccsDefaultParams
  | OperatorAcc
  | AccessControlConditions
)[];
export type EvmContractConditions = (
  | AccsEVMParams
  | OperatorAcc
  | EvmContractConditions
)[];
export type SolRpcConditions = (
  | AccsSOLV2Params
  | OperatorAcc
  | SolRpcConditions
)[];
export type UnifiedAccessControlConditions = (
  | AccsParams
  | OperatorAcc
  | UnifiedAccessControlConditions
)[];

/**
 * @deprecated
 */
export type JsonRequest = JsonExecutionRequest | JsonSignChainDataRequest;

export type SupportedJsonRequests =
  | JsonSigningRetrieveRequest
  | JsonEncryptionRetrieveRequest;

export type Chain = z.infer<typeof ChainSchema>;

/**
 *
 * The default required properties of all chains
 *
 * @typedef { Object } LITChainRequiredProps
 */
export type LITChainRequiredProps = z.infer<typeof LitBaseChainSchema>;

/**
 * @typedef { Object } LITEVMChain
 * @property { string } contractAddress - The address of the token contract for the optional predeployed ERC1155 contract.  Only present on EVM chains.
 * @property { string } chainId - The chain ID of the chain that this token contract is deployed on.  Used for EVM chains.
 * @property { string } name - The human readable name of the chain
 */
export type LITEVMChain = z.infer<typeof LitEVMChainSchema>;
export type LITEVMChains = z.infer<typeof LitEVMChainsSchema>;

/**
 * @typedef { Object } LITSVMChain
 */
export type LITSVMChain = z.infer<typeof LitSVMChainSchema>;
export type LITSVMChains = z.infer<typeof LitSVMChainsSchema>;

/**
 * @typedef { Object } LITCosmosChain
 * @property {string} chainId - The chain ID of the chain that this token contract is deployed on.  Used for Cosmos chains.
 */
export type LITCosmosChain = z.infer<typeof LitCosmosChainSchema>;
export type LITCosmosChains = z.infer<typeof LitCosmosChainsSchema>;

/**
 * @typedef {Object} LITChain
 * @property {string} vmType - Either EVM for an Ethereum compatible chain or SVM for a Solana compatible chain
 * @property {string} name - The human readable name of the chain
 */
export type LITChain = z.infer<typeof AllLitChainsSchema>;

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

export type LitContract = z.infer<typeof LitContractSchema>;

export type ExclusiveLitContractContext = z.infer<
  typeof ExclusiveLitContractContextSchema
>;
export type LitContractContext = z.infer<typeof LitContractContextSchema>;

export type ContractName = keyof ExclusiveLitContractContext;

export type LitContractResolverContext = z.infer<
  typeof LitContractResolverContextSchema
>;

export type ResponseStrategy = z.infer<typeof ResponseStrategySchema>;

export type LitResourcePrefix = z.infer<typeof LitResourcePrefixSchema>;

export type LitAbility = z.infer<typeof LitAbilitySchema>;

export type DerivedAddresses = z.infer<typeof DerivedAddressesSchema>;

export type TokenInfo = z.infer<typeof TokenInfoSchema>;

export type EpochInfo = z.infer<typeof EpochInfoSchema>;
