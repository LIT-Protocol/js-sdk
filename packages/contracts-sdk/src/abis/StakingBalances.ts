import { ContractTransaction } from 'ethers';
import { Arrayish, BigNumber, BigNumberish, Interface } from 'ethers/utils';
import { EthersContractContext } from 'ethereum-abi-types-generator';

export type ContractContext = EthersContractContext<
  StakingBalances,
  StakingBalancesEventsContext,
  StakingBalancesEvents
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
export type StakingBalancesEvents =
  | 'AliasAdded'
  | 'AliasRemoved'
  | 'MaxAliasCountSet'
  | 'MaximumStakeSet'
  | 'MinimumStakeSet'
  | 'OwnershipTransferred'
  | 'PermittedStakerAdded'
  | 'PermittedStakerRemoved'
  | 'PermittedStakersOnChanged'
  | 'ResolverContractAddressSet'
  | 'RewardPaid'
  | 'Staked'
  | 'TokenRewardPerTokenPerEpochSet'
  | 'ValidatorNotRewardedBecauseAlias'
  | 'ValidatorRewarded'
  | 'ValidatorTokensPenalized'
  | 'Withdrawn';
export interface StakingBalancesEventsContext {
  AliasAdded(...parameters: any): EventFilter;
  AliasRemoved(...parameters: any): EventFilter;
  MaxAliasCountSet(...parameters: any): EventFilter;
  MaximumStakeSet(...parameters: any): EventFilter;
  MinimumStakeSet(...parameters: any): EventFilter;
  OwnershipTransferred(...parameters: any): EventFilter;
  PermittedStakerAdded(...parameters: any): EventFilter;
  PermittedStakerRemoved(...parameters: any): EventFilter;
  PermittedStakersOnChanged(...parameters: any): EventFilter;
  ResolverContractAddressSet(...parameters: any): EventFilter;
  RewardPaid(...parameters: any): EventFilter;
  Staked(...parameters: any): EventFilter;
  TokenRewardPerTokenPerEpochSet(...parameters: any): EventFilter;
  ValidatorNotRewardedBecauseAlias(...parameters: any): EventFilter;
  ValidatorRewarded(...parameters: any): EventFilter;
  ValidatorTokensPenalized(...parameters: any): EventFilter;
  Withdrawn(...parameters: any): EventFilter;
}
export type StakingBalancesMethodNames =
  | 'new'
  | 'addAlias'
  | 'addPermittedStaker'
  | 'addPermittedStakers'
  | 'aliasCounts'
  | 'aliases'
  | 'balanceOf'
  | 'balances'
  | 'checkStakingAmounts'
  | 'contractResolver'
  | 'env'
  | 'getReward'
  | 'getStakingAddress'
  | 'getTokenAddress'
  | 'isPermittedStaker'
  | 'maxAliasCount'
  | 'maximumStake'
  | 'minimumStake'
  | 'owner'
  | 'penalizeTokens'
  | 'penaltyBalance'
  | 'permittedStakers'
  | 'permittedStakersOn'
  | 'removeAlias'
  | 'removePermittedStaker'
  | 'renounceOwnership'
  | 'restakePenaltyTokens'
  | 'rewardOf'
  | 'rewardValidator'
  | 'rewards'
  | 'setContractResolver'
  | 'setMaxAliasCount'
  | 'setMaximumStake'
  | 'setMinimumStake'
  | 'setPermittedStakersOn'
  | 'stake'
  | 'totalStaked'
  | 'transferOwnership'
  | 'transferPenaltyTokens'
  | 'withdraw'
  | 'withdraw'
  | 'withdrawPenaltyTokens';
export interface AliasAddedEventEmittedResponse {
  staker: string;
  aliasAccount: string;
}
export interface AliasRemovedEventEmittedResponse {
  staker: string;
  aliasAccount: string;
}
export interface MaxAliasCountSetEventEmittedResponse {
  newMaxAliasCount: BigNumberish;
}
export interface MaximumStakeSetEventEmittedResponse {
  newMaximumStake: BigNumberish;
}
export interface MinimumStakeSetEventEmittedResponse {
  newMinimumStake: BigNumberish;
}
export interface OwnershipTransferredEventEmittedResponse {
  previousOwner: string;
  newOwner: string;
}
export interface PermittedStakerAddedEventEmittedResponse {
  staker: string;
}
export interface PermittedStakerRemovedEventEmittedResponse {
  staker: string;
}
export interface PermittedStakersOnChangedEventEmittedResponse {
  permittedStakersOn: boolean;
}
export interface ResolverContractAddressSetEventEmittedResponse {
  newResolverAddress: string;
}
export interface RewardPaidEventEmittedResponse {
  staker: string;
  reward: BigNumberish;
}
export interface StakedEventEmittedResponse {
  staker: string;
  amount: BigNumberish;
}
export interface TokenRewardPerTokenPerEpochSetEventEmittedResponse {
  newTokenRewardPerTokenPerEpoch: BigNumberish;
}
export interface ValidatorNotRewardedBecauseAliasEventEmittedResponse {
  staker: string;
  aliasAccount: string;
}
export interface ValidatorRewardedEventEmittedResponse {
  staker: string;
  amount: BigNumberish;
}
export interface ValidatorTokensPenalizedEventEmittedResponse {
  staker: string;
  amount: BigNumberish;
}
export interface WithdrawnEventEmittedResponse {
  staker: string;
  amount: BigNumberish;
}
export interface StakingBalances {
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
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param aliasAccount Type: address, Indexed: false
   */
  addAlias(
    aliasAccount: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param staker Type: address, Indexed: false
   */
  addPermittedStaker(
    staker: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param stakers Type: address[], Indexed: false
   */
  addPermittedStakers(
    stakers: string[],
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   */
  aliasCounts(
    parameter0: string,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   */
  aliases(
    parameter0: string,
    overrides?: ContractCallOverrides
  ): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param account Type: address, Indexed: false
   */
  balanceOf(
    account: string,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   */
  balances(
    parameter0: string,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param account Type: address, Indexed: false
   */
  checkStakingAmounts(
    account: string,
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
   * StateMutability: view
   * Type: function
   */
  env(overrides?: ContractCallOverrides): Promise<number>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param account Type: address, Indexed: false
   */
  getReward(
    account: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getStakingAddress(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getTokenAddress(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param staker Type: address, Indexed: false
   */
  isPermittedStaker(
    staker: string,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  maxAliasCount(overrides?: ContractCallOverrides): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  maximumStake(overrides?: ContractCallOverrides): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  minimumStake(overrides?: ContractCallOverrides): Promise<BigNumber>;
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
   * @param amount Type: uint256, Indexed: false
   * @param account Type: address, Indexed: false
   */
  penalizeTokens(
    amount: BigNumberish,
    account: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  penaltyBalance(overrides?: ContractCallOverrides): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   */
  permittedStakers(
    parameter0: string,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  permittedStakersOn(overrides?: ContractCallOverrides): Promise<boolean>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param aliasAccount Type: address, Indexed: false
   */
  removeAlias(
    aliasAccount: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param staker Type: address, Indexed: false
   */
  removePermittedStaker(
    staker: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
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
   * @param staker Type: address, Indexed: false
   * @param balance Type: uint256, Indexed: false
   */
  restakePenaltyTokens(
    staker: string,
    balance: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param account Type: address, Indexed: false
   */
  rewardOf(
    account: string,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param amount Type: uint256, Indexed: false
   * @param account Type: address, Indexed: false
   */
  rewardValidator(
    amount: BigNumberish,
    account: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   */
  rewards(
    parameter0: string,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
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
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newMaxAliasCount Type: uint256, Indexed: false
   */
  setMaxAliasCount(
    newMaxAliasCount: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newMaximumStake Type: uint256, Indexed: false
   */
  setMaximumStake(
    newMaximumStake: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newMinimumStake Type: uint256, Indexed: false
   */
  setMinimumStake(
    newMinimumStake: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param permitted Type: bool, Indexed: false
   */
  setPermittedStakersOn(
    permitted: boolean,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param amount Type: uint256, Indexed: false
   * @param account Type: address, Indexed: false
   */
  stake(
    amount: BigNumberish,
    account: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  totalStaked(overrides?: ContractCallOverrides): Promise<BigNumber>;
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
   * @param balance Type: uint256, Indexed: false
   * @param recipient Type: address, Indexed: false
   */
  transferPenaltyTokens(
    balance: BigNumberish,
    recipient: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param amount Type: uint256, Indexed: false
   * @param account Type: address, Indexed: false
   */
  withdraw(
    amount: BigNumberish,
    account: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  withdraw(
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param balance Type: uint256, Indexed: false
   */
  withdrawPenaltyTokens(
    balance: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
}
