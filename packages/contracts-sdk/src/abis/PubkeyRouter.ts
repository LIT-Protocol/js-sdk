import { ContractTransaction } from 'ethers';

// --- Replaced Content ---
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { BigNumber, BigNumberish } from 'ethers';

export interface Arrayish {
    toHexString(): string;
    slice(start?: number, end?: number): Arrayish;
    length: number;
    [index: number]: number;
}

export type ContractContext = ContractContextLegacy & {
    populateTransaction: ContractContextLegacy
}
// --- Replaced Content ---
import { EthersContractContext } from 'ethereum-abi-types-generator';

export type ContractContextLegacy = EthersContractContext<
  PubkeyRouter,
  PubkeyRouterEventsContext,
  PubkeyRouterEvents
>;

export declare type EventFilter = {
  address?: string;
  topics?: Array<string>;
  fromBlock?: string | number;
  toBlock?: string | number;
};

export interface ContractTransactionOverrides {
  /**
   * The maximum units of gas for the transaction to use
   */
  gasLimit?: number;
  /**
   * The price (in wei) per unit of gas
   */
  gasPrice?: BigNumber | string | number | Promise<any>;
  /**
   * The nonce to use in the transaction
   */
  nonce?: number;
  /**
   * The amount to send with the transaction (i.e. msg.value)
   */
  value?: BigNumber | string | number | Promise<any>;
  /**
   * The chain ID (or network ID) to use
   */
  chainId?: number;
}

export interface ContractCallOverrides {
  /**
   * The address to execute the call as
   */
  from?: string;
  /**
   * The maximum units of gas for the transaction to use
   */
  gasLimit?: number;
}
export type PubkeyRouterEvents =
  | 'ContractResolverAddressSet'
  | 'PubkeyRoutingDataSet'
  | 'RoleAdminChanged'
  | 'RoleGranted'
  | 'RoleRevoked'
  | 'RootKeySet';
export interface PubkeyRouterEventsContext {
  ContractResolverAddressSet(...parameters: any): EventFilter;
  PubkeyRoutingDataSet(...parameters: any): EventFilter;
  RoleAdminChanged(...parameters: any): EventFilter;
  RoleGranted(...parameters: any): EventFilter;
  RoleRevoked(...parameters: any): EventFilter;
  RootKeySet(...parameters: any): EventFilter;
}
export type PubkeyRouterMethodNames =
  | 'new'
  | 'ADMIN_ROLE'
  | 'DEFAULT_ADMIN_ROLE'
  | 'checkNodeSignatures'
  | 'contractResolver'
  | 'deriveEthAddressFromPubkey'
  | 'env'
  | 'ethAddressToPkpId'
  | 'getDerivedPubkey'
  | 'getEthAddress'
  | 'getPkpNftAddress'
  | 'getPubkey'
  | 'getRoleAdmin'
  | 'getRootKeys'
  | 'getRoutingData'
  | 'grantRole'
  | 'hasRole'
  | 'isRouted'
  | 'pubkeys'
  | 'renounceRole'
  | 'revokeRole'
  | 'rootKeys'
  | 'setContractResolver'
  | 'setRoutingData'
  | 'setRoutingDataAsAdmin'
  | 'supportsInterface'
  | 'voteForRootKeys'
  | 'votesToRegisterRootKeys';
export interface ContractResolverAddressSetEventEmittedResponse {
  newResolverAddress: string;
}
export interface PubkeyRoutingDataSetEventEmittedResponse {
  tokenId: BigNumberish;
  pubkey: Arrayish;
  stakingContract: string;
  keyType: BigNumberish;
  derivedKeyId: Arrayish;
}
export interface RoleAdminChangedEventEmittedResponse {
  role: Arrayish;
  previousAdminRole: Arrayish;
  newAdminRole: Arrayish;
}
export interface RoleGrantedEventEmittedResponse {
  role: Arrayish;
  account: string;
  sender: string;
}
export interface RoleRevokedEventEmittedResponse {
  role: Arrayish;
  account: string;
  sender: string;
}
export interface RootKeyEventEmittedResponse {
  pubkey: Arrayish;
  keyType: BigNumberish;
}
export interface RootKeySetEventEmittedResponse {
  stakingContract: string;
  rootKey: RootKeyEventEmittedResponse;
}
export interface CheckNodeSignaturesRequest {
  r: Arrayish;
  s: Arrayish;
  v: BigNumberish;
}
export interface RootkeyResponse {
  pubkey: string;
  0: string;
  keyType: BigNumber;
  1: BigNumber;
}
export interface PubkeyroutingdataResponse {
  pubkey: string;
  0: string;
  keyType: BigNumber;
  1: BigNumber;
  derivedKeyId: string;
  2: string;
}
export interface PubkeysResponse {
  pubkey: string;
  0: string;
  keyType: BigNumber;
  1: BigNumber;
  derivedKeyId: string;
  2: string;
  length: 3;
}
export interface RootKeysResponse {
  pubkey: string;
  0: string;
  keyType: BigNumber;
  1: BigNumber;
  length: 2;
}
export interface VoteForRootKeysRequest {
  pubkey: Arrayish;
  keyType: BigNumberish;
}
export interface PubkeyRouter {
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: constructor
   * @param _resolver Type: address, Indexed: false
   * @param _env Type: uint8, Indexed: false
   */
  'new'(
    _resolver: string,
    _env: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  ADMIN_ROLE(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  DEFAULT_ADMIN_ROLE(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param signatures Type: tuple[], Indexed: false
   * @param signedMessage Type: bytes, Indexed: false
   * @param stakingContractAddress Type: address, Indexed: false
   */
  checkNodeSignatures(
    signatures: CheckNodeSignaturesRequest[],
    signedMessage: Arrayish,
    stakingContractAddress: string,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  contractResolver(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: pure
   * Type: function
   * @param pubkey Type: bytes, Indexed: false
   */
  deriveEthAddressFromPubkey(
    pubkey: Arrayish,
    overrides?: ContractCallOverrides
  ): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  env(overrides?: ContractCallOverrides): Promise<number>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   */
  ethAddressToPkpId(
    parameter0: string,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param stakingContract Type: address, Indexed: false
   * @param derivedKeyId Type: bytes32, Indexed: false
   */
  getDerivedPubkey(
    stakingContract: string,
    derivedKeyId: Arrayish,
    overrides?: ContractCallOverrides
  ): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  getEthAddress(
    tokenId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getPkpNftAddress(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  getPubkey(
    tokenId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param role Type: bytes32, Indexed: false
   */
  getRoleAdmin(
    role: Arrayish,
    overrides?: ContractCallOverrides
  ): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param stakingContract Type: address, Indexed: false
   */
  getRootKeys(
    stakingContract: string,
    overrides?: ContractCallOverrides
  ): Promise<RootkeyResponse[]>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  getRoutingData(
    tokenId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<PubkeyroutingdataResponse>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param role Type: bytes32, Indexed: false
   * @param account Type: address, Indexed: false
   */
  grantRole(
    role: Arrayish,
    account: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param role Type: bytes32, Indexed: false
   * @param account Type: address, Indexed: false
   */
  hasRole(
    role: Arrayish,
    account: string,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  isRouted(
    tokenId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: uint256, Indexed: false
   */
  pubkeys(
    parameter0: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<PubkeysResponse>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param role Type: bytes32, Indexed: false
   * @param account Type: address, Indexed: false
   */
  renounceRole(
    role: Arrayish,
    account: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param role Type: bytes32, Indexed: false
   * @param account Type: address, Indexed: false
   */
  revokeRole(
    role: Arrayish,
    account: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   * @param parameter1 Type: uint256, Indexed: false
   */
  rootKeys(
    parameter0: string,
    parameter1: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<RootKeysResponse>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newResolverAddress Type: address, Indexed: false
   */
  setContractResolver(
    newResolverAddress: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param pubkey Type: bytes, Indexed: false
   * @param stakingContractAddress Type: address, Indexed: false
   * @param keyType Type: uint256, Indexed: false
   * @param derivedKeyId Type: bytes32, Indexed: false
   */
  setRoutingData(
    tokenId: BigNumberish,
    pubkey: Arrayish,
    stakingContractAddress: string,
    keyType: BigNumberish,
    derivedKeyId: Arrayish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param pubkey Type: bytes, Indexed: false
   * @param stakingContract Type: address, Indexed: false
   * @param keyType Type: uint256, Indexed: false
   * @param derivedKeyId Type: bytes32, Indexed: false
   */
  setRoutingDataAsAdmin(
    tokenId: BigNumberish,
    pubkey: Arrayish,
    stakingContract: string,
    keyType: BigNumberish,
    derivedKeyId: Arrayish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param interfaceId Type: bytes4, Indexed: false
   */
  supportsInterface(
    interfaceId: Arrayish,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param stakingContractAddress Type: address, Indexed: false
   * @param newRootKeys Type: tuple[], Indexed: false
   */
  voteForRootKeys(
    stakingContractAddress: string,
    newRootKeys: VoteForRootKeysRequest[],
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   * @param parameter1 Type: bytes, Indexed: false
   */
  votesToRegisterRootKeys(
    parameter0: string,
    parameter1: Arrayish,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
}
