import { ContractTransaction } from 'ethers';

// --- Replaced Content ---
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { BigNumber, BigNumberish } from 'ethers';

export interface Arrayish {
  toHexString(): string;
  slice(start?: number, end?: number): Arrayish;
  length: number;
  [index: number]: number;
}

export type ContractContext = ContractContextLegacy & {
  populateTransaction: ContractContextLegacy;
};
// --- Replaced Content ---
import { EthersContractContext } from 'ethereum-abi-types-generator';

export type ContractContextLegacy = EthersContractContext<
  AccessControlConditions,
  AccessControlConditionsEventsContext,
  AccessControlConditionsEvents
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
export type AccessControlConditionsEvents =
  | 'ConditionStored'
  | 'OwnershipTransferred';
export interface AccessControlConditionsEventsContext {
  ConditionStored(...parameters: any): EventFilter;
  OwnershipTransferred(...parameters: any): EventFilter;
}
export type AccessControlConditionsMethodNames =
  | 'new'
  | 'getCondition'
  | 'owner'
  | 'renounceOwnership'
  | 'setSigner'
  | 'signer'
  | 'storeCondition'
  | 'storeConditionWithSigner'
  | 'storedConditions'
  | 'transferOwnership';
export interface ConditionStoredEventEmittedResponse {
  key: BigNumberish;
  value: BigNumberish;
  chainId: BigNumberish;
  permanent: boolean;
  creator: string;
}
export interface OwnershipTransferredEventEmittedResponse {
  previousOwner: string;
  newOwner: string;
}
export interface StoredconditionResponse {
  value: BigNumber;
  0: BigNumber;
  securityHash: BigNumber;
  1: BigNumber;
  chainId: BigNumber;
  2: BigNumber;
  permanent: boolean;
  3: boolean;
  creator: string;
  4: string;
}
export interface StoredConditionsResponse {
  value: BigNumber;
  0: BigNumber;
  securityHash: BigNumber;
  1: BigNumber;
  chainId: BigNumber;
  2: BigNumber;
  permanent: boolean;
  3: boolean;
  creator: string;
  4: string;
  length: 5;
}
export interface AccessControlConditions {
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: constructor
   */
  'new'(
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param key Type: uint256, Indexed: false
   */
  getCondition(
    key: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<StoredconditionResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  owner(overrides?: ContractCallOverrides): Promise<string>;
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
   * @param newSigner Type: address, Indexed: false
   */
  setSigner(
    newSigner: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  signer(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param key Type: uint256, Indexed: false
   * @param value Type: uint256, Indexed: false
   * @param securityHash Type: uint256, Indexed: false
   * @param chainId Type: uint256, Indexed: false
   * @param permanent Type: bool, Indexed: false
   */
  storeCondition(
    key: BigNumberish,
    value: BigNumberish,
    securityHash: BigNumberish,
    chainId: BigNumberish,
    permanent: boolean,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param key Type: uint256, Indexed: false
   * @param value Type: uint256, Indexed: false
   * @param securityHash Type: uint256, Indexed: false
   * @param chainId Type: uint256, Indexed: false
   * @param permanent Type: bool, Indexed: false
   * @param creatorAddress Type: address, Indexed: false
   */
  storeConditionWithSigner(
    key: BigNumberish,
    value: BigNumberish,
    securityHash: BigNumberish,
    chainId: BigNumberish,
    permanent: boolean,
    creatorAddress: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: uint256, Indexed: false
   */
  storedConditions(
    parameter0: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<StoredConditionsResponse>;
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
}
