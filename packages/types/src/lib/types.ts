import * as ethers from 'ethers';
import { z } from 'zod';

import {
  ChainSchema,
  DerivedAddressesSchema,
  EpochInfoSchema,
  LitAbilitySchema,
  LitNetworkKeysSchema,
  LitResourcePrefixSchema,
  ResponseStrategySchema,
  TokenInfoSchema,
} from '@lit-protocol/schemas';

import {
  AuthMethod,
  LitRelayConfig,
  Signature,
  JsonEncryptionRetrieveRequest,
  JsonExecutionRequest,
  JsonSignChainDataRequest,
  JsonSigningRetrieveRequest,
} from './interfaces';

import type {
  AtomAcc,
  EvmBasicAcc,
  EvmContractAcc,
  OperatorAcc,
  SolAcc,
} from '@lit-protocol/access-control-conditions-schemas';

export {
  DefinedJson,
  DefinedLiteral,
  Json,
  Literal,
} from '@lit-protocol/schemas';

// Zod only derives string, not giving real type safety over it
export type Hex = `0x${string}`; // z.infer<typeof HexSchema>;

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

export type JsonRequest = JsonExecutionRequest | JsonSignChainDataRequest;

export type SupportedJsonRequests =
  | JsonSigningRetrieveRequest
  | JsonEncryptionRetrieveRequest;

export type Chain = z.infer<typeof ChainSchema>;

export type LIT_NETWORKS_KEYS = z.infer<typeof LitNetworkKeysSchema>;

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LitContractContext = Record<string, string | any> &
  ExclusiveLitContractContext;

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

export type ResponseStrategy = z.infer<typeof ResponseStrategySchema>;

export type LitResourcePrefix = z.infer<typeof LitResourcePrefixSchema>;

export type LitAbility = z.infer<typeof LitAbilitySchema>;

export type DerivedAddresses = z.infer<typeof DerivedAddressesSchema>;

export type TokenInfo = z.infer<typeof TokenInfoSchema>;

/**
 * from the `getActiveUnkickedValidatorStructsAndCounts` Staking contract function
   epochLength: _BigNumber { _hex: '0x05dc', _isBigNumber: true },
  number: _BigNumber { _hex: '0x04c5', _isBigNumber: true },
  endTime: _BigNumber { _hex: '0x66c75b12', _isBigNumber: true },
  retries: _BigNumber { _hex: '0x03', _isBigNumber: true },
  timeout: _BigNumber { _hex: '0x3c', _isBigNumber: true }
 */
export type EpochInfo = z.infer<typeof EpochInfoSchema>;
