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
  PKPHelper,
  PKPHelperEventsContext,
  PKPHelperEvents
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
export type PKPHelperEvents = 'OwnershipTransferred';
export interface PKPHelperEventsContext {
  OwnershipTransferred(...parameters: any): EventFilter;
}
export type PKPHelperMethodNames =
  | 'new'
  | 'mintNextAndAddAuthMethods'
  | 'mintNextAndAddAuthMethodsWithTypes'
  | 'onERC721Received'
  | 'owner'
  | 'pkpNFT'
  | 'pkpPermissions'
  | 'renounceOwnership'
  | 'setPkpNftAddress'
  | 'setPkpPermissionsAddress'
  | 'transferOwnership';
export interface OwnershipTransferredEventEmittedResponse {
  previousOwner: string;
  newOwner: string;
}
export interface PKPHelper {
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: constructor
   * @param _pkpNft Type: address, Indexed: false
   * @param _pkpPermissions Type: address, Indexed: false
   */
  'new'(
    _pkpNft: string,
    _pkpPermissions: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param keyType Type: uint256, Indexed: false
   * @param permittedAuthMethodTypes Type: uint256[], Indexed: false
   * @param permittedAuthMethodIds Type: bytes[], Indexed: false
   * @param permittedAuthMethodPubkeys Type: bytes[], Indexed: false
   * @param permittedAuthMethodScopes Type: uint256[][], Indexed: false
   * @param addPkpEthAddressAsPermittedAddress Type: bool, Indexed: false
   * @param sendPkpToItself Type: bool, Indexed: false
   */
  mintNextAndAddAuthMethods(
    keyType: BigNumberish,
    permittedAuthMethodTypes: BigNumberish[],
    permittedAuthMethodIds: Arrayish[],
    permittedAuthMethodPubkeys: Arrayish[],
    permittedAuthMethodScopes: BigNumberish[][],
    addPkpEthAddressAsPermittedAddress: boolean,
    sendPkpToItself: boolean,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param keyType Type: uint256, Indexed: false
   * @param permittedIpfsCIDs Type: bytes[], Indexed: false
   * @param permittedIpfsCIDScopes Type: uint256[][], Indexed: false
   * @param permittedAddresses Type: address[], Indexed: false
   * @param permittedAddressScopes Type: uint256[][], Indexed: false
   * @param permittedAuthMethodTypes Type: uint256[], Indexed: false
   * @param permittedAuthMethodIds Type: bytes[], Indexed: false
   * @param permittedAuthMethodPubkeys Type: bytes[], Indexed: false
   * @param permittedAuthMethodScopes Type: uint256[][], Indexed: false
   * @param addPkpEthAddressAsPermittedAddress Type: bool, Indexed: false
   * @param sendPkpToItself Type: bool, Indexed: false
   */
  mintNextAndAddAuthMethodsWithTypes(
    keyType: BigNumberish,
    permittedIpfsCIDs: Arrayish[],
    permittedIpfsCIDScopes: BigNumberish[][],
    permittedAddresses: string[],
    permittedAddressScopes: BigNumberish[][],
    permittedAuthMethodTypes: BigNumberish[],
    permittedAuthMethodIds: Arrayish[],
    permittedAuthMethodPubkeys: Arrayish[],
    permittedAuthMethodScopes: BigNumberish[][],
    addPkpEthAddressAsPermittedAddress: boolean,
    sendPkpToItself: boolean,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   * @param parameter1 Type: address, Indexed: false
   * @param parameter2 Type: uint256, Indexed: false
   * @param parameter3 Type: bytes, Indexed: false
   */
  onERC721Received(
    parameter0: string,
    parameter1: string,
    parameter2: BigNumberish,
    parameter3: Arrayish,
    overrides?: ContractCallOverrides
  ): Promise<string>;
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
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  pkpPermissions(overrides?: ContractCallOverrides): Promise<string>;
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
   * @param newPkpPermissionsAddress Type: address, Indexed: false
   */
  setPkpPermissionsAddress(
    newPkpPermissionsAddress: string,
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
}
