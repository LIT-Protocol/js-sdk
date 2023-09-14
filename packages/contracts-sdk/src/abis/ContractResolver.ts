import { ContractTransaction } from 'ethers';
import { Arrayish, BigNumber, BigNumberish, Interface } from 'ethers/utils';
import { EthersContractContext } from 'ethereum-abi-types-generator';

export type ContractContext = EthersContractContext<
  ContractResolver,
  ContractResolverEventsContext,
  ContractResolverEvents
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
export type ContractResolverEvents =
  | 'AllowedEnvAdded'
  | 'AllowedEnvRemoved'
  | 'RoleAdminChanged'
  | 'RoleGranted'
  | 'RoleRevoked'
  | 'SetContract';
export interface ContractResolverEventsContext {
  AllowedEnvAdded(...parameters: any): EventFilter;
  AllowedEnvRemoved(...parameters: any): EventFilter;
  RoleAdminChanged(...parameters: any): EventFilter;
  RoleGranted(...parameters: any): EventFilter;
  RoleRevoked(...parameters: any): EventFilter;
  SetContract(...parameters: any): EventFilter;
}
export type ContractResolverMethodNames =
  | 'new'
  | 'ADMIN_ROLE'
  | 'ALLOWLIST_CONTRACT'
  | 'DEFAULT_ADMIN_ROLE'
  | 'DOMAIN_WALLET_ORACLE'
  | 'DOMAIN_WALLET_REGISTRY'
  | 'HD_KEY_DERIVER_CONTRACT'
  | 'LIT_TOKEN_CONTRACT'
  | 'MULTI_SENDER_CONTRACT'
  | 'PKP_HELPER_CONTRACT'
  | 'PKP_NFT_CONTRACT'
  | 'PKP_NFT_METADATA_CONTRACT'
  | 'PKP_PERMISSIONS_CONTRACT'
  | 'PUB_KEY_ROUTER_CONTRACT'
  | 'RATE_LIMIT_NFT_CONTRACT'
  | 'RELEASE_REGISTER_CONTRACT'
  | 'STAKING_BALANCES_CONTRACT'
  | 'STAKING_CONTRACT'
  | 'addAllowedEnv'
  | 'getContract'
  | 'getRoleAdmin'
  | 'grantRole'
  | 'hasRole'
  | 'removeAllowedEnv'
  | 'renounceRole'
  | 'revokeRole'
  | 'setAdmin'
  | 'setContract'
  | 'supportsInterface'
  | 'typeAddresses';
export interface AllowedEnvAddedEventEmittedResponse {
  env: BigNumberish;
}
export interface AllowedEnvRemovedEventEmittedResponse {
  env: BigNumberish;
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
export interface SetContractEventEmittedResponse {
  typ: Arrayish;
  env: BigNumberish;
  addr: string;
}
export interface ContractResolver {
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: constructor
   * @param env Type: uint8, Indexed: false
   */
  'new'(
    env: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
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
  ALLOWLIST_CONTRACT(overrides?: ContractCallOverrides): Promise<string>;
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
   */
  DOMAIN_WALLET_ORACLE(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  DOMAIN_WALLET_REGISTRY(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  HD_KEY_DERIVER_CONTRACT(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  LIT_TOKEN_CONTRACT(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  MULTI_SENDER_CONTRACT(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  PKP_HELPER_CONTRACT(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  PKP_NFT_CONTRACT(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  PKP_NFT_METADATA_CONTRACT(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  PKP_PERMISSIONS_CONTRACT(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  PUB_KEY_ROUTER_CONTRACT(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  RATE_LIMIT_NFT_CONTRACT(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  RELEASE_REGISTER_CONTRACT(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  STAKING_BALANCES_CONTRACT(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  STAKING_CONTRACT(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param env Type: uint8, Indexed: false
   */
  addAllowedEnv(
    env: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param typ Type: bytes32, Indexed: false
   * @param env Type: uint8, Indexed: false
   */
  getContract(
    typ: Arrayish,
    env: BigNumberish,
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
  ): Promise<ContractTransaction>;
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
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param env Type: uint8, Indexed: false
   */
  removeAllowedEnv(
    env: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
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
  ): Promise<ContractTransaction>;
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
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newAdmin Type: address, Indexed: false
   */
  setAdmin(
    newAdmin: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param typ Type: bytes32, Indexed: false
   * @param env Type: uint8, Indexed: false
   * @param addr Type: address, Indexed: false
   */
  setContract(
    typ: Arrayish,
    env: BigNumberish,
    addr: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
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
   * @param parameter0 Type: bytes32, Indexed: false
   * @param parameter1 Type: uint8, Indexed: false
   */
  typeAddresses(
    parameter0: Arrayish,
    parameter1: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<string>;
}
