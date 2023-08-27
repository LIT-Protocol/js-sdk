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
export type PKPHelperEvents =
  | 'ContractResolverAddressSet'
  | 'OwnershipTransferred'
  | 'RoleAdminChanged'
  | 'RoleGranted'
  | 'RoleRevoked';
export interface PKPHelperEventsContext {
  ContractResolverAddressSet(...parameters: any): EventFilter;
  OwnershipTransferred(...parameters: any): EventFilter;
  RoleAdminChanged(...parameters: any): EventFilter;
  RoleGranted(...parameters: any): EventFilter;
  RoleRevoked(...parameters: any): EventFilter;
}
export type PKPHelperMethodNames =
  | 'new'
  | 'DEFAULT_ADMIN_ROLE'
  | 'claimAndMintNextAndAddAuthMethods'
  | 'claimAndMintNextAndAddAuthMethodsWithTypes'
  | 'contractResolver'
  | 'env'
  | 'getDomainWalletRegistry'
  | 'getPKPNftMetdataAddress'
  | 'getPkpNftAddress'
  | 'getPkpPermissionsAddress'
  | 'getRoleAdmin'
  | 'grantRole'
  | 'hasRole'
  | 'mintNextAndAddAuthMethods'
  | 'mintNextAndAddAuthMethodsWithTypes'
  | 'mintNextAndAddDomainWalletMetadata'
  | 'onERC721Received'
  | 'owner'
  | 'removePkpMetadata'
  | 'renounceOwnership'
  | 'renounceRole'
  | 'revokeRole'
  | 'setContractResolver'
  | 'setPkpMetadata'
  | 'supportsInterface'
  | 'transferOwnership';
export interface ContractResolverAddressSetEventEmittedResponse {
  newResolverAddress: string;
}
export interface OwnershipTransferredEventEmittedResponse {
  previousOwner: string;
  newOwner: string;
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
export interface ClaimAndMintNextAndAddAuthMethodsRequest {
  r: Arrayish;
  s: Arrayish;
  v: BigNumberish;
}
export interface ClaimAndMintNextAndAddAuthMethodsWithTypesRequest {
  r: Arrayish;
  s: Arrayish;
  v: BigNumberish;
}
export interface PKPHelper {
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
  DEFAULT_ADMIN_ROLE(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param keyType Type: uint256, Indexed: false
   * @param derivedKeyId Type: bytes32, Indexed: false
   * @param signatures Type: tuple[], Indexed: false
   * @param permittedAuthMethodTypes Type: uint256[], Indexed: false
   * @param permittedAuthMethodIds Type: bytes[], Indexed: false
   * @param permittedAuthMethodPubkeys Type: bytes[], Indexed: false
   * @param permittedAuthMethodScopes Type: uint256[][], Indexed: false
   * @param addPkpEthAddressAsPermittedAddress Type: bool, Indexed: false
   * @param sendPkpToItself Type: bool, Indexed: false
   */
  claimAndMintNextAndAddAuthMethods(
    keyType: BigNumberish,
    derivedKeyId: Arrayish,
    signatures: ClaimAndMintNextAndAddAuthMethodsRequest[],
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
   * @param derivedKeyId Type: bytes32, Indexed: false
   * @param signatures Type: tuple[], Indexed: false
   * @param permittedAddresses Type: address[], Indexed: false
   * @param permittedAddressScopes Type: uint256[][], Indexed: false
   * @param permittedAuthMethodTypes Type: uint256[], Indexed: false
   * @param permittedAuthMethodIds Type: bytes[], Indexed: false
   * @param permittedAuthMethodPubkeys Type: bytes[], Indexed: false
   * @param permittedAuthMethodScopes Type: uint256[][], Indexed: false
   * @param addPkpEthAddressAsPermittedAddress Type: bool, Indexed: false
   * @param sendPkpToItself Type: bool, Indexed: false
   */
  claimAndMintNextAndAddAuthMethodsWithTypes(
    keyType: BigNumberish,
    derivedKeyId: Arrayish,
    signatures: ClaimAndMintNextAndAddAuthMethodsWithTypesRequest[],
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
   */
  contractResolver(overrides?: ContractCallOverrides): Promise<string>;
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
   */
  getDomainWalletRegistry(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getPKPNftMetdataAddress(overrides?: ContractCallOverrides): Promise<string>;
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
   */
  getPkpPermissionsAddress(overrides?: ContractCallOverrides): Promise<string>;
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
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param keyType Type: uint256, Indexed: false
   * @param permittedAuthMethodTypes Type: uint256[], Indexed: false
   * @param permittedAuthMethodIds Type: bytes[], Indexed: false
   * @param permittedAuthMethodPubkeys Type: bytes[], Indexed: false
   * @param permittedAuthMethodScopes Type: uint256[][], Indexed: false
   * @param nftMetadata Type: string[], Indexed: false
   * @param addPkpEthAddressAsPermittedAddress Type: bool, Indexed: false
   * @param sendPkpToItself Type: bool, Indexed: false
   */
  mintNextAndAddDomainWalletMetadata(
    keyType: BigNumberish,
    permittedAuthMethodTypes: BigNumberish[],
    permittedAuthMethodIds: Arrayish[],
    permittedAuthMethodPubkeys: Arrayish[],
    permittedAuthMethodScopes: BigNumberish[][],
    nftMetadata: string[],
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
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  removePkpMetadata(
    tokenId: BigNumberish,
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
   * @param nftMetadata Type: string[], Indexed: false
   */
  setPkpMetadata(
    tokenId: BigNumberish,
    nftMetadata: string[],
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
   * @param newOwner Type: address, Indexed: false
   */
  transferOwnership(
    newOwner: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
}
