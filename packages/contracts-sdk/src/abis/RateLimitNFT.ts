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
  RateLimitNFT,
  RateLimitNFTEventsContext,
  RateLimitNFTEvents
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
export type RateLimitNFTEvents =
  | 'AdditionalRequestsPerKilosecondCostSet'
  | 'Approval'
  | 'ApprovalForAll'
  | 'FreeMintSignerSet'
  | 'FreeRequestsPerRateLimitWindowSet'
  | 'OwnershipTransferred'
  | 'RLIHolderRateLimitWindowSecondsSet'
  | 'RateLimitWindowSecondsSet'
  | 'Transfer'
  | 'Withdrew';
export interface RateLimitNFTEventsContext {
  AdditionalRequestsPerKilosecondCostSet(...parameters: any): EventFilter;
  Approval(...parameters: any): EventFilter;
  ApprovalForAll(...parameters: any): EventFilter;
  FreeMintSignerSet(...parameters: any): EventFilter;
  FreeRequestsPerRateLimitWindowSet(...parameters: any): EventFilter;
  OwnershipTransferred(...parameters: any): EventFilter;
  RLIHolderRateLimitWindowSecondsSet(...parameters: any): EventFilter;
  RateLimitWindowSecondsSet(...parameters: any): EventFilter;
  Transfer(...parameters: any): EventFilter;
  Withdrew(...parameters: any): EventFilter;
}
export type RateLimitNFTMethodNames =
  | 'new'
  | 'RLIHolderRateLimitWindowSeconds'
  | 'additionalRequestsPerKilosecondCost'
  | 'approve'
  | 'balanceOf'
  | 'burn'
  | 'calculateCost'
  | 'calculateRequestsPerKilosecond'
  | 'capacity'
  | 'defaultRateLimitWindowSeconds'
  | 'freeMint'
  | 'freeMintSigTest'
  | 'freeMintSigner'
  | 'freeRequestsPerRateLimitWindow'
  | 'getApproved'
  | 'isApprovedForAll'
  | 'isExpired'
  | 'mint'
  | 'name'
  | 'owner'
  | 'ownerOf'
  | 'prefixed'
  | 'redeemedFreeMints'
  | 'renounceOwnership'
  | 'safeTransferFrom'
  | 'safeTransferFrom'
  | 'setAdditionalRequestsPerKilosecondCost'
  | 'setApprovalForAll'
  | 'setFreeMintSigner'
  | 'setFreeRequestsPerRateLimitWindow'
  | 'setRLIHolderRateLimitWindowSeconds'
  | 'setRateLimitWindowSeconds'
  | 'supportsInterface'
  | 'symbol'
  | 'tokenByIndex'
  | 'tokenIdCounter'
  | 'tokenOfOwnerByIndex'
  | 'tokenURI'
  | 'totalSupply'
  | 'transferFrom'
  | 'transferOwnership'
  | 'withdraw';
export interface AdditionalRequestsPerKilosecondCostSetEventEmittedResponse {
  newAdditionalRequestsPerKilosecondCost: BigNumberish;
}
export interface ApprovalEventEmittedResponse {
  owner: string;
  approved: string;
  tokenId: BigNumberish;
}
export interface ApprovalForAllEventEmittedResponse {
  owner: string;
  operator: string;
  approved: boolean;
}
export interface FreeMintSignerSetEventEmittedResponse {
  newFreeMintSigner: string;
}
export interface FreeRequestsPerRateLimitWindowSetEventEmittedResponse {
  newFreeRequestsPerRateLimitWindow: BigNumberish;
}
export interface OwnershipTransferredEventEmittedResponse {
  previousOwner: string;
  newOwner: string;
}
export interface RLIHolderRateLimitWindowSecondsSetEventEmittedResponse {
  newRLIHolderRateLimitWindowSeconds: BigNumberish;
}
export interface RateLimitWindowSecondsSetEventEmittedResponse {
  newRateLimitWindowSeconds: BigNumberish;
}
export interface TransferEventEmittedResponse {
  from: string;
  to: string;
  tokenId: BigNumberish;
}
export interface WithdrewEventEmittedResponse {
  amount: BigNumberish;
}
export interface CapacityResponse {
  requestsPerKilosecond: BigNumber;
  0: BigNumber;
  expiresAt: BigNumber;
  1: BigNumber;
  length: 2;
}
export interface RateLimitNFT {
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: constructor
   */
  'new'(overrides?: ContractTransactionOverrides): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  RLIHolderRateLimitWindowSeconds(
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  additionalRequestsPerKilosecondCost(
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param to Type: address, Indexed: false
   * @param tokenId Type: uint256, Indexed: false
   */
  approve(
    to: string,
    tokenId: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param owner Type: address, Indexed: false
   */
  balanceOf(
    owner: string,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  burn(
    tokenId: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param requestsPerKilosecond Type: uint256, Indexed: false
   * @param expiresAt Type: uint256, Indexed: false
   */
  calculateCost(
    requestsPerKilosecond: BigNumberish,
    expiresAt: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param payingAmount Type: uint256, Indexed: false
   * @param expiresAt Type: uint256, Indexed: false
   */
  calculateRequestsPerKilosecond(
    payingAmount: BigNumberish,
    expiresAt: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: uint256, Indexed: false
   */
  capacity(
    parameter0: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<CapacityResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  defaultRateLimitWindowSeconds(
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param expiresAt Type: uint256, Indexed: false
   * @param requestsPerKilosecond Type: uint256, Indexed: false
   * @param msgHash Type: bytes32, Indexed: false
   * @param v Type: uint8, Indexed: false
   * @param r Type: bytes32, Indexed: false
   * @param s Type: bytes32, Indexed: false
   */
  freeMint(
    expiresAt: BigNumberish,
    requestsPerKilosecond: BigNumberish,
    msgHash: Arrayish,
    v: BigNumberish,
    r: Arrayish,
    s: Arrayish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param expiresAt Type: uint256, Indexed: false
   * @param requestsPerKilosecond Type: uint256, Indexed: false
   * @param msgHash Type: bytes32, Indexed: false
   * @param v Type: uint8, Indexed: false
   * @param r Type: bytes32, Indexed: false
   * @param s Type: bytes32, Indexed: false
   */
  freeMintSigTest(
    expiresAt: BigNumberish,
    requestsPerKilosecond: BigNumberish,
    msgHash: Arrayish,
    v: BigNumberish,
    r: Arrayish,
    s: Arrayish,
    overrides?: ContractCallOverrides
  ): Promise<void>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  freeMintSigner(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  freeRequestsPerRateLimitWindow(
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  getApproved(
    tokenId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param owner Type: address, Indexed: false
   * @param operator Type: address, Indexed: false
   */
  isApprovedForAll(
    owner: string,
    operator: string,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  isExpired(
    tokenId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
  /**
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param expiresAt Type: uint256, Indexed: false
   */
  mint(
    expiresAt: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  name(overrides?: ContractCallOverrides): Promise<string>;
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
   * @param tokenId Type: uint256, Indexed: false
   */
  ownerOf(
    tokenId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: pure
   * Type: function
   * @param hash Type: bytes32, Indexed: false
   */
  prefixed(hash: Arrayish, overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: bytes32, Indexed: false
   */
  redeemedFreeMints(
    parameter0: Arrayish,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
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
   * @param from Type: address, Indexed: false
   * @param to Type: address, Indexed: false
   * @param tokenId Type: uint256, Indexed: false
   */
  safeTransferFrom(
    from: string,
    to: string,
    tokenId: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param from Type: address, Indexed: false
   * @param to Type: address, Indexed: false
   * @param tokenId Type: uint256, Indexed: false
   * @param data Type: bytes, Indexed: false
   */
  safeTransferFrom(
    from: string,
    to: string,
    tokenId: BigNumberish,
    data: Arrayish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newAdditionalRequestsPerKilosecondCost Type: uint256, Indexed: false
   */
  setAdditionalRequestsPerKilosecondCost(
    newAdditionalRequestsPerKilosecondCost: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param operator Type: address, Indexed: false
   * @param approved Type: bool, Indexed: false
   */
  setApprovalForAll(
    operator: string,
    approved: boolean,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newFreeMintSigner Type: address, Indexed: false
   */
  setFreeMintSigner(
    newFreeMintSigner: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newFreeRequestsPerRateLimitWindow Type: uint256, Indexed: false
   */
  setFreeRequestsPerRateLimitWindow(
    newFreeRequestsPerRateLimitWindow: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newRLIHolderRateLimitWindowSeconds Type: uint256, Indexed: false
   */
  setRLIHolderRateLimitWindowSeconds(
    newRLIHolderRateLimitWindowSeconds: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newRateLimitWindowSeconds Type: uint256, Indexed: false
   */
  setRateLimitWindowSeconds(
    newRateLimitWindowSeconds: BigNumberish,
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
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  symbol(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param index Type: uint256, Indexed: false
   */
  tokenByIndex(
    index: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  tokenIdCounter(overrides?: ContractCallOverrides): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param owner Type: address, Indexed: false
   * @param index Type: uint256, Indexed: false
   */
  tokenOfOwnerByIndex(
    owner: string,
    index: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  tokenURI(
    tokenId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  totalSupply(overrides?: ContractCallOverrides): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param from Type: address, Indexed: false
   * @param to Type: address, Indexed: false
   * @param tokenId Type: uint256, Indexed: false
   */
  transferFrom(
    from: string,
    to: string,
    tokenId: BigNumberish,
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
}
