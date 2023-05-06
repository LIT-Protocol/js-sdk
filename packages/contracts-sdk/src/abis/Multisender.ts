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
  Multisender,
  MultisenderEventsContext,
  MultisenderEvents
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
export type MultisenderEvents = 'OwnershipTransferred';
export interface MultisenderEventsContext {
  OwnershipTransferred(...parameters: any): EventFilter;
}
export type MultisenderMethodNames =
  | 'owner'
  | 'renounceOwnership'
  | 'sendEth'
  | 'sendTokens'
  | 'transferOwnership'
  | 'withdraw'
  | 'withdrawTokens';
export interface OwnershipTransferredEventEmittedResponse {
  previousOwner: string;
  newOwner: string;
}
export interface Multisender {
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
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param _recipients Type: address[], Indexed: false
   */
  sendEth(
    _recipients: string[],
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _recipients Type: address[], Indexed: false
   * @param tokenContract Type: address, Indexed: false
   */
  sendTokens(
    _recipients: string[],
    tokenContract: string,
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
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  withdraw(
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenContract Type: address, Indexed: false
   */
  withdrawTokens(
    tokenContract: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
}
