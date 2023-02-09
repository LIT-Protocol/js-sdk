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
  PKPPermissions,
  PKPPermissionsEventsContext,
  PKPPermissionsEvents
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
export type PKPPermissionsEvents =
  | 'OwnershipTransferred'
  | 'PermittedAuthMethodAdded'
  | 'PermittedAuthMethodRemoved'
  | 'PermittedAuthMethodScopeAdded'
  | 'PermittedAuthMethodScopeRemoved'
  | 'RootHashUpdated';
export interface PKPPermissionsEventsContext {
  OwnershipTransferred(...parameters: any): EventFilter;
  PermittedAuthMethodAdded(...parameters: any): EventFilter;
  PermittedAuthMethodRemoved(...parameters: any): EventFilter;
  PermittedAuthMethodScopeAdded(...parameters: any): EventFilter;
  PermittedAuthMethodScopeRemoved(...parameters: any): EventFilter;
  RootHashUpdated(...parameters: any): EventFilter;
}
export type PKPPermissionsMethodNames =
  | 'new'
  | 'addPermittedAction'
  | 'addPermittedAddress'
  | 'addPermittedAuthMethod'
  | 'addPermittedAuthMethodScope'
  | 'authMethods'
  | 'getAuthMethodId'
  | 'getEthAddress'
  | 'getPermittedActions'
  | 'getPermittedAddresses'
  | 'getPermittedAuthMethodScopes'
  | 'getPermittedAuthMethods'
  | 'getPubkey'
  | 'getTokenIdsForAuthMethod'
  | 'getUserPubkeyForAuthMethod'
  | 'isPermittedAction'
  | 'isPermittedAddress'
  | 'isPermittedAuthMethod'
  | 'isPermittedAuthMethodScopePresent'
  | 'owner'
  | 'pkpNFT'
  | 'removePermittedAction'
  | 'removePermittedAddress'
  | 'removePermittedAuthMethod'
  | 'removePermittedAuthMethodScope'
  | 'renounceOwnership'
  | 'setPkpNftAddress'
  | 'setRootHash'
  | 'transferOwnership'
  | 'verifyState'
  | 'verifyStates';
export interface OwnershipTransferredEventEmittedResponse {
  previousOwner: string;
  newOwner: string;
}
export interface PermittedAuthMethodAddedEventEmittedResponse {
  tokenId: BigNumberish;
  authMethodType: BigNumberish;
  id: Arrayish;
  userPubkey: Arrayish;
}
export interface PermittedAuthMethodRemovedEventEmittedResponse {
  tokenId: BigNumberish;
  authMethodType: BigNumberish;
  id: Arrayish;
}
export interface PermittedAuthMethodScopeAddedEventEmittedResponse {
  tokenId: BigNumberish;
  authMethodType: BigNumberish;
  id: Arrayish;
  scopeId: BigNumberish;
}
export interface PermittedAuthMethodScopeRemovedEventEmittedResponse {
  tokenId: BigNumberish;
  authMethodType: BigNumberish;
  id: Arrayish;
  scopeId: BigNumberish;
}
export interface RootHashUpdatedEventEmittedResponse {
  tokenId: BigNumberish;
  group: BigNumberish;
  root: Arrayish;
}
export interface AddPermittedAuthMethodRequest {
  authMethodType: BigNumberish;
  id: Arrayish;
  userPubkey: Arrayish;
}
export interface AuthMethodsResponse {
  authMethodType: BigNumber;
  0: BigNumber;
  id: string;
  1: string;
  userPubkey: string;
  2: string;
  length: 3;
}
export interface AuthmethodResponse {
  authMethodType: BigNumber;
  0: BigNumber;
  id: string;
  1: string;
  userPubkey: string;
  2: string;
}
export interface PKPPermissions {
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: constructor
   * @param _pkpNft Type: address, Indexed: false
   */
  'new'(
    _pkpNft: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param ipfsCID Type: bytes, Indexed: false
   * @param scopes Type: uint256[], Indexed: false
   */
  addPermittedAction(
    tokenId: BigNumberish,
    ipfsCID: Arrayish,
    scopes: BigNumberish[],
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param user Type: address, Indexed: false
   * @param scopes Type: uint256[], Indexed: false
   */
  addPermittedAddress(
    tokenId: BigNumberish,
    user: string,
    scopes: BigNumberish[],
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param authMethod Type: tuple, Indexed: false
   * @param scopes Type: uint256[], Indexed: false
   */
  addPermittedAuthMethod(
    tokenId: BigNumberish,
    authMethod: AddPermittedAuthMethodRequest,
    scopes: BigNumberish[],
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param authMethodType Type: uint256, Indexed: false
   * @param id Type: bytes, Indexed: false
   * @param scopeId Type: uint256, Indexed: false
   */
  addPermittedAuthMethodScope(
    tokenId: BigNumberish,
    authMethodType: BigNumberish,
    id: Arrayish,
    scopeId: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: uint256, Indexed: false
   */
  authMethods(
    parameter0: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<AuthMethodsResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: pure
   * Type: function
   * @param authMethodType Type: uint256, Indexed: false
   * @param id Type: bytes, Indexed: false
   */
  getAuthMethodId(
    authMethodType: BigNumberish,
    id: Arrayish,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
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
   * @param tokenId Type: uint256, Indexed: false
   */
  getPermittedActions(
    tokenId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<string[]>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  getPermittedAddresses(
    tokenId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<string[]>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param authMethodType Type: uint256, Indexed: false
   * @param id Type: bytes, Indexed: false
   * @param maxScopeId Type: uint256, Indexed: false
   */
  getPermittedAuthMethodScopes(
    tokenId: BigNumberish,
    authMethodType: BigNumberish,
    id: Arrayish,
    maxScopeId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<boolean[]>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  getPermittedAuthMethods(
    tokenId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<AuthmethodResponse[]>;
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
   * @param authMethodType Type: uint256, Indexed: false
   * @param id Type: bytes, Indexed: false
   */
  getTokenIdsForAuthMethod(
    authMethodType: BigNumberish,
    id: Arrayish,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber[]>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param authMethodType Type: uint256, Indexed: false
   * @param id Type: bytes, Indexed: false
   */
  getUserPubkeyForAuthMethod(
    authMethodType: BigNumberish,
    id: Arrayish,
    overrides?: ContractCallOverrides
  ): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param ipfsCID Type: bytes, Indexed: false
   */
  isPermittedAction(
    tokenId: BigNumberish,
    ipfsCID: Arrayish,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param user Type: address, Indexed: false
   */
  isPermittedAddress(
    tokenId: BigNumberish,
    user: string,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param authMethodType Type: uint256, Indexed: false
   * @param id Type: bytes, Indexed: false
   */
  isPermittedAuthMethod(
    tokenId: BigNumberish,
    authMethodType: BigNumberish,
    id: Arrayish,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param authMethodType Type: uint256, Indexed: false
   * @param id Type: bytes, Indexed: false
   * @param scopeId Type: uint256, Indexed: false
   */
  isPermittedAuthMethodScopePresent(
    tokenId: BigNumberish,
    authMethodType: BigNumberish,
    id: Arrayish,
    scopeId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  owner(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  pkpNFT(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param ipfsCID Type: bytes, Indexed: false
   */
  removePermittedAction(
    tokenId: BigNumberish,
    ipfsCID: Arrayish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param user Type: address, Indexed: false
   */
  removePermittedAddress(
    tokenId: BigNumberish,
    user: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param authMethodType Type: uint256, Indexed: false
   * @param id Type: bytes, Indexed: false
   */
  removePermittedAuthMethod(
    tokenId: BigNumberish,
    authMethodType: BigNumberish,
    id: Arrayish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param authMethodType Type: uint256, Indexed: false
   * @param id Type: bytes, Indexed: false
   * @param scopeId Type: uint256, Indexed: false
   */
  removePermittedAuthMethodScope(
    tokenId: BigNumberish,
    authMethodType: BigNumberish,
    id: Arrayish,
    scopeId: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  renounceOwnership(
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newPkpNftAddress Type: address, Indexed: false
   */
  setPkpNftAddress(
    newPkpNftAddress: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param group Type: uint256, Indexed: false
   * @param root Type: bytes32, Indexed: false
   */
  setRootHash(
    tokenId: BigNumberish,
    group: BigNumberish,
    root: Arrayish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newOwner Type: address, Indexed: false
   */
  transferOwnership(
    newOwner: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param group Type: uint256, Indexed: false
   * @param proof Type: bytes32[], Indexed: false
   * @param leaf Type: bytes32, Indexed: false
   */
  verifyState(
    tokenId: BigNumberish,
    group: BigNumberish,
    proof: Arrayish[],
    leaf: Arrayish,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param group Type: uint256, Indexed: false
   * @param proof Type: bytes32[], Indexed: false
   * @param proofFlags Type: bool[], Indexed: false
   * @param leaves Type: bytes32[], Indexed: false
   */
  verifyStates(
    tokenId: BigNumberish,
    group: BigNumberish,
    proof: Arrayish[],
    proofFlags: boolean[],
    leaves: Arrayish[],
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
}
