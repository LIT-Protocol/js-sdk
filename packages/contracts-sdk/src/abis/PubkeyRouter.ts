import { ContractTransaction } from 'ethers';
import { BigNumber, BigNumberish } from 'ethers';
        
        export interface Arrayish {
            toHexString(): string;
            slice(start?: number, end?: number): Arrayish;
            length: number;
            [index: number]: number;
        }
        
import { EthersContractContext } from 'ethereum-abi-types-generator';

export type ContractContext = EthersContractContext<
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
  | 'OwnershipTransferred'
  | 'PubkeyRoutingDataSet'
  | 'PubkeyRoutingDataVote';
export interface PubkeyRouterEventsContext {
  OwnershipTransferred(...parameters: any): EventFilter;
  PubkeyRoutingDataSet(...parameters: any): EventFilter;
  PubkeyRoutingDataVote(...parameters: any): EventFilter;
}
export type PubkeyRouterMethodNames =
  | 'new'
  | 'ethAddressToPkpId'
  | 'getEthAddress'
  | 'getPubkey'
  | 'getRoutingData'
  | 'isRouted'
  | 'owner'
  | 'pkpNFT'
  | 'pubkeyRegistrations'
  | 'pubkeys'
  | 'renounceOwnership'
  | 'setPkpNftAddress'
  | 'setRoutingData'
  | 'transferOwnership'
  | 'voteForRoutingData';
export interface OwnershipTransferredEventEmittedResponse {
  previousOwner: string;
  newOwner: string;
}
export interface PubkeyRoutingDataSetEventEmittedResponse {
  tokenId: BigNumberish;
  pubkey: Arrayish;
  stakingContract: string;
  keyType: BigNumberish;
}
export interface PubkeyRoutingDataVoteEventEmittedResponse {
  tokenId: BigNumberish;
  nodeAddress: string;
  pubkey: Arrayish;
  stakingContract: string;
  keyType: BigNumberish;
}
export interface PubkeyroutingdataResponse {
  pubkey: string;
  0: string;
  stakingContract: string;
  1: string;
  keyType: BigNumber;
  2: BigNumber;
}
export interface RoutingDataResponse {
  pubkey: string;
  0: string;
  stakingContract: string;
  1: string;
  keyType: BigNumber;
  2: BigNumber;
}
export interface PubkeyRegistrationsResponse {
  routingData: RoutingDataResponse;
  0: RoutingDataResponse;
  nodeVoteCount: BigNumber;
  1: BigNumber;
  nodeVoteThreshold: BigNumber;
  2: BigNumber;
  length: 3;
}
export interface PubkeysResponse {
  pubkey: string;
  0: string;
  stakingContract: string;
  1: string;
  keyType: BigNumber;
  2: BigNumber;
  length: 3;
}
export interface PubkeyRouter {
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
  ): Promise<ContractTransaction>;
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
  getPubkey(
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
  getRoutingData(
    tokenId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<PubkeyroutingdataResponse>;
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
   * @param parameter0 Type: uint256, Indexed: false
   */
  pubkeyRegistrations(
    parameter0: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<PubkeyRegistrationsResponse>;
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
   */
  renounceOwnership(
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
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
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param pubkey Type: bytes, Indexed: false
   * @param stakingContract Type: address, Indexed: false
   * @param keyType Type: uint256, Indexed: false
   */
  setRoutingData(
    tokenId: BigNumberish,
    pubkey: Arrayish,
    stakingContract: string,
    keyType: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
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
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param pubkey Type: bytes, Indexed: false
   * @param stakingContract Type: address, Indexed: false
   * @param keyType Type: uint256, Indexed: false
   */
  voteForRoutingData(
    tokenId: BigNumberish,
    pubkey: Arrayish,
    stakingContract: string,
    keyType: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
}
