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
  Staking,
  StakingEventsContext,
  StakingEvents
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
export type StakingEvents =
  | 'EpochLengthSet'
  | 'EpochTimeoutSet'
  | 'KickPenaltyPercentSet'
  | 'MinimumStakeSet'
  | 'OwnershipTransferred'
  | 'Paused'
  | 'ReadyForNextEpoch'
  | 'Recovered'
  | 'RequestToJoin'
  | 'RequestToLeave'
  | 'ResolverContractAddressSet'
  | 'RewardPaid'
  | 'RewardsDurationUpdated'
  | 'Staked'
  | 'StakingTokenSet'
  | 'StateChanged'
  | 'TokenRewardPerTokenPerEpochSet'
  | 'Unpaused'
  | 'ValidatorKickedFromNextEpoch'
  | 'VotedToKickValidatorInNextEpoch'
  | 'Withdrawn';
export interface StakingEventsContext {
  EpochLengthSet(...parameters: any): EventFilter;
  EpochTimeoutSet(...parameters: any): EventFilter;
  KickPenaltyPercentSet(...parameters: any): EventFilter;
  MinimumStakeSet(...parameters: any): EventFilter;
  OwnershipTransferred(...parameters: any): EventFilter;
  Paused(...parameters: any): EventFilter;
  ReadyForNextEpoch(...parameters: any): EventFilter;
  Recovered(...parameters: any): EventFilter;
  RequestToJoin(...parameters: any): EventFilter;
  RequestToLeave(...parameters: any): EventFilter;
  ResolverContractAddressSet(...parameters: any): EventFilter;
  RewardPaid(...parameters: any): EventFilter;
  RewardsDurationUpdated(...parameters: any): EventFilter;
  Staked(...parameters: any): EventFilter;
  StakingTokenSet(...parameters: any): EventFilter;
  StateChanged(...parameters: any): EventFilter;
  TokenRewardPerTokenPerEpochSet(...parameters: any): EventFilter;
  Unpaused(...parameters: any): EventFilter;
  ValidatorKickedFromNextEpoch(...parameters: any): EventFilter;
  VotedToKickValidatorInNextEpoch(...parameters: any): EventFilter;
  Withdrawn(...parameters: any): EventFilter;
}
export type StakingMethodNames =
  | 'new'
  | 'adminKickValidatorInNextEpoch'
  | 'adminSlashValidator'
  | 'advanceEpoch'
  | 'balanceOf'
  | 'epoch'
  | 'exit'
  | 'getReward'
  | 'getValidatorsInCurrentEpoch'
  | 'getValidatorsInNextEpoch'
  | 'getVotingStatusToKickValidator'
  | 'isActiveValidator'
  | 'isReadyForNextEpoch'
  | 'kickPenaltyPercent'
  | 'kickValidatorInNextEpoch'
  | 'lockValidatorsForNextEpoch'
  | 'minimumStake'
  | 'nodeAddressToStakerAddress'
  | 'owner'
  | 'pauseEpoch'
  | 'paused'
  | 'readyForNextEpoch'
  | 'renounceOwnership'
  | 'requestToJoin'
  | 'requestToLeave'
  | 'resolverContractAddress'
  | 'rewardOf'
  | 'setEpochLength'
  | 'setEpochState'
  | 'setEpochTimeout'
  | 'setIpPortNodeAddressAndCommunicationPubKeys'
  | 'setKickPenaltyPercent'
  | 'setMinimumStake'
  | 'setResolverContractAddress'
  | 'setStakingToken'
  | 'setTokenRewardPerTokenPerEpoch'
  | 'shouldKickValidator'
  | 'signalReadyForNextEpoch'
  | 'stake'
  | 'stakeAndJoin'
  | 'stakingToken'
  | 'state'
  | 'tokenRewardPerTokenPerEpoch'
  | 'totalStaked'
  | 'transferOwnership'
  | 'unlockValidatorsForNextEpoch'
  | 'validatorCountForConsensus'
  | 'validatorStateIsActive'
  | 'validatorStateIsUnlocked'
  | 'validators'
  | 'validatorsInNextEpochAreLocked'
  | 'votesToKickValidatorsInNextEpoch'
  | 'withdraw';
export interface EpochLengthSetEventEmittedResponse {
  newEpochLength: BigNumberish;
}
export interface EpochTimeoutSetEventEmittedResponse {
  newEpochTimeout: BigNumberish;
}
export interface KickPenaltyPercentSetEventEmittedResponse {
  newKickPenaltyPercent: BigNumberish;
}
export interface MinimumStakeSetEventEmittedResponse {
  newMinimumStake: BigNumberish;
}
export interface OwnershipTransferredEventEmittedResponse {
  previousOwner: string;
  newOwner: string;
}
export interface PausedEventEmittedResponse {
  account: string;
}
export interface ReadyForNextEpochEventEmittedResponse {
  staker: string;
}
export interface RecoveredEventEmittedResponse {
  token: string;
  amount: BigNumberish;
}
export interface RequestToJoinEventEmittedResponse {
  staker: string;
}
export interface RequestToLeaveEventEmittedResponse {
  staker: string;
}
export interface ResolverContractAddressSetEventEmittedResponse {
  newResolverContractAddress: string;
}
export interface RewardPaidEventEmittedResponse {
  staker: string;
  reward: BigNumberish;
}
export interface RewardsDurationUpdatedEventEmittedResponse {
  newDuration: BigNumberish;
}
export interface StakedEventEmittedResponse {
  staker: string;
  amount: BigNumberish;
}
export interface StakingTokenSetEventEmittedResponse {
  newStakingTokenAddress: string;
}
export interface StateChangedEventEmittedResponse {
  newState: BigNumberish;
}
export interface TokenRewardPerTokenPerEpochSetEventEmittedResponse {
  newTokenRewardPerTokenPerEpoch: BigNumberish;
}
export interface UnpausedEventEmittedResponse {
  account: string;
}
export interface ValidatorKickedFromNextEpochEventEmittedResponse {
  staker: string;
  amountBurned: BigNumberish;
}
export interface VotedToKickValidatorInNextEpochEventEmittedResponse {
  reporter: string;
  validatorStakerAddress: string;
  reason: BigNumberish;
  data: Arrayish;
}
export interface WithdrawnEventEmittedResponse {
  staker: string;
  amount: BigNumberish;
}
export interface EpochResponse {
  epochLength: BigNumber;
  0: BigNumber;
  number: BigNumber;
  1: BigNumber;
  endBlock: BigNumber;
  2: BigNumber;
  retries: BigNumber;
  3: BigNumber;
  timeout: BigNumber;
  4: BigNumber;
  length: 5;
}
export interface GetVotingStatusToKickValidatorResponse {
  result0: BigNumber;
  0: BigNumber;
  result1: boolean;
  1: boolean;
  length: 2;
}
export interface ValidatorsResponse {
  ip: number;
  0: number;
  ipv6: BigNumber;
  1: BigNumber;
  port: number;
  2: number;
  nodeAddress: string;
  3: string;
  balance: BigNumber;
  4: BigNumber;
  reward: BigNumber;
  5: BigNumber;
  senderPubKey: BigNumber;
  6: BigNumber;
  receiverPubKey: BigNumber;
  7: BigNumber;
  length: 8;
}
export interface Staking {
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: constructor
   * @param _stakingToken Type: address, Indexed: false
   */
  'new'(
    _stakingToken: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param validatorStakerAddress Type: address, Indexed: false
   */
  adminKickValidatorInNextEpoch(
    validatorStakerAddress: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param validatorStakerAddress Type: address, Indexed: false
   * @param amountToBurn Type: uint256, Indexed: false
   */
  adminSlashValidator(
    validatorStakerAddress: string,
    amountToBurn: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  advanceEpoch(
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
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
   */
  epoch(overrides?: ContractCallOverrides): Promise<EpochResponse>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  exit(
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  getReward(
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getValidatorsInCurrentEpoch(
    overrides?: ContractCallOverrides
  ): Promise<string[]>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getValidatorsInNextEpoch(
    overrides?: ContractCallOverrides
  ): Promise<string[]>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param epochNumber Type: uint256, Indexed: false
   * @param validatorStakerAddress Type: address, Indexed: false
   * @param voterStakerAddress Type: address, Indexed: false
   */
  getVotingStatusToKickValidator(
    epochNumber: BigNumberish,
    validatorStakerAddress: string,
    voterStakerAddress: string,
    overrides?: ContractCallOverrides
  ): Promise<GetVotingStatusToKickValidatorResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param account Type: address, Indexed: false
   */
  isActiveValidator(
    account: string,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  isReadyForNextEpoch(overrides?: ContractCallOverrides): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  kickPenaltyPercent(overrides?: ContractCallOverrides): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param validatorStakerAddress Type: address, Indexed: false
   * @param reason Type: uint256, Indexed: false
   * @param data Type: bytes, Indexed: false
   */
  kickValidatorInNextEpoch(
    validatorStakerAddress: string,
    reason: BigNumberish,
    data: Arrayish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  lockValidatorsForNextEpoch(
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
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
   * @param parameter0 Type: address, Indexed: false
   */
  nodeAddressToStakerAddress(
    parameter0: string,
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
   */
  pauseEpoch(
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  paused(overrides?: ContractCallOverrides): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   */
  readyForNextEpoch(
    parameter0: string,
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
   * @param ip Type: uint32, Indexed: false
   * @param ipv6 Type: uint128, Indexed: false
   * @param port Type: uint32, Indexed: false
   * @param nodeAddress Type: address, Indexed: false
   * @param senderPubKey Type: uint256, Indexed: false
   * @param receiverPubKey Type: uint256, Indexed: false
   */
  requestToJoin(
    ip: BigNumberish,
    ipv6: BigNumberish,
    port: BigNumberish,
    nodeAddress: string,
    senderPubKey: BigNumberish,
    receiverPubKey: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  requestToLeave(
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  resolverContractAddress(overrides?: ContractCallOverrides): Promise<string>;
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
   * @param newEpochLength Type: uint256, Indexed: false
   */
  setEpochLength(
    newEpochLength: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newState Type: uint8, Indexed: false
   */
  setEpochState(
    newState: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newEpochTimeout Type: uint256, Indexed: false
   */
  setEpochTimeout(
    newEpochTimeout: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param ip Type: uint32, Indexed: false
   * @param ipv6 Type: uint128, Indexed: false
   * @param port Type: uint32, Indexed: false
   * @param nodeAddress Type: address, Indexed: false
   * @param senderPubKey Type: uint256, Indexed: false
   * @param receiverPubKey Type: uint256, Indexed: false
   */
  setIpPortNodeAddressAndCommunicationPubKeys(
    ip: BigNumberish,
    ipv6: BigNumberish,
    port: BigNumberish,
    nodeAddress: string,
    senderPubKey: BigNumberish,
    receiverPubKey: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newKickPenaltyPercent Type: uint256, Indexed: false
   */
  setKickPenaltyPercent(
    newKickPenaltyPercent: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
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
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newResolverContractAddress Type: address, Indexed: false
   */
  setResolverContractAddress(
    newResolverContractAddress: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newStakingTokenAddress Type: address, Indexed: false
   */
  setStakingToken(
    newStakingTokenAddress: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newTokenRewardPerTokenPerEpoch Type: uint256, Indexed: false
   */
  setTokenRewardPerTokenPerEpoch(
    newTokenRewardPerTokenPerEpoch: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param stakerAddress Type: address, Indexed: false
   */
  shouldKickValidator(
    stakerAddress: string,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  signalReadyForNextEpoch(
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param amount Type: uint256, Indexed: false
   */
  stake(
    amount: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param amount Type: uint256, Indexed: false
   * @param ip Type: uint32, Indexed: false
   * @param ipv6 Type: uint128, Indexed: false
   * @param port Type: uint32, Indexed: false
   * @param nodeAddress Type: address, Indexed: false
   * @param senderPubKey Type: uint256, Indexed: false
   * @param receiverPubKey Type: uint256, Indexed: false
   */
  stakeAndJoin(
    amount: BigNumberish,
    ip: BigNumberish,
    ipv6: BigNumberish,
    port: BigNumberish,
    nodeAddress: string,
    senderPubKey: BigNumberish,
    receiverPubKey: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  stakingToken(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  state(overrides?: ContractCallOverrides): Promise<number>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  tokenRewardPerTokenPerEpoch(
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
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
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  unlockValidatorsForNextEpoch(
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  validatorCountForConsensus(
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  validatorStateIsActive(overrides?: ContractCallOverrides): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  validatorStateIsUnlocked(overrides?: ContractCallOverrides): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   */
  validators(
    parameter0: string,
    overrides?: ContractCallOverrides
  ): Promise<ValidatorsResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  validatorsInNextEpochAreLocked(
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: uint256, Indexed: false
   * @param parameter1 Type: address, Indexed: false
   */
  votesToKickValidatorsInNextEpoch(
    parameter0: BigNumberish,
    parameter1: string,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param amount Type: uint256, Indexed: false
   */
  withdraw(
    amount: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction & TransactionRequest>;
}
