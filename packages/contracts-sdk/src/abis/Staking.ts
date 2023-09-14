import { ContractTransaction } from 'ethers';
import { Arrayish, BigNumber, BigNumberish, Interface } from 'ethers/utils';
import { EthersContractContext } from 'ethereum-abi-types-generator';

export type ContractContext = EthersContractContext<
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
  | 'ConfigSet'
  | 'EpochEndTimeSet'
  | 'EpochLengthSet'
  | 'EpochTimeoutSet'
  | 'KickPenaltyPercentSet'
  | 'OwnershipTransferred'
  | 'ReadyForNextEpoch'
  | 'Recovered'
  | 'RequestToJoin'
  | 'RequestToLeave'
  | 'ResolverContractAddressSet'
  | 'RewardsDurationUpdated'
  | 'StakingTokenSet'
  | 'StateChanged'
  | 'ValidatorKickedFromNextEpoch'
  | 'ValidatorRejoinedNextEpoch'
  | 'VotedToKickValidatorInNextEpoch';
export interface StakingEventsContext {
  ConfigSet(...parameters: any): EventFilter;
  EpochEndTimeSet(...parameters: any): EventFilter;
  EpochLengthSet(...parameters: any): EventFilter;
  EpochTimeoutSet(...parameters: any): EventFilter;
  KickPenaltyPercentSet(...parameters: any): EventFilter;
  OwnershipTransferred(...parameters: any): EventFilter;
  ReadyForNextEpoch(...parameters: any): EventFilter;
  Recovered(...parameters: any): EventFilter;
  RequestToJoin(...parameters: any): EventFilter;
  RequestToLeave(...parameters: any): EventFilter;
  ResolverContractAddressSet(...parameters: any): EventFilter;
  RewardsDurationUpdated(...parameters: any): EventFilter;
  StakingTokenSet(...parameters: any): EventFilter;
  StateChanged(...parameters: any): EventFilter;
  ValidatorKickedFromNextEpoch(...parameters: any): EventFilter;
  ValidatorRejoinedNextEpoch(...parameters: any): EventFilter;
  VotedToKickValidatorInNextEpoch(...parameters: any): EventFilter;
}
export type StakingMethodNames =
  | 'new'
  | 'adminKickValidatorInNextEpoch'
  | 'adminRejoinValidator'
  | 'adminSlashValidator'
  | 'advanceEpoch'
  | 'config'
  | 'contractResolver'
  | 'countOfCurrentValidatorsReadyForNextEpoch'
  | 'countOfNextValidatorsReadyForNextEpoch'
  | 'currentValidatorCountForConsensus'
  | 'env'
  | 'epoch'
  | 'exit'
  | 'getKeyTypes'
  | 'getKickedValidators'
  | 'getReward'
  | 'getStakingBalancesAddress'
  | 'getTokenAddress'
  | 'getValidatorsInCurrentEpoch'
  | 'getValidatorsInCurrentEpochLength'
  | 'getValidatorsInNextEpoch'
  | 'getValidatorsStructs'
  | 'getValidatorsStructsInCurrentEpoch'
  | 'getValidatorsStructsInNextEpoch'
  | 'getVotingStatusToKickValidator'
  | 'isActiveValidator'
  | 'isActiveValidatorByNodeAddress'
  | 'isReadyForNextEpoch'
  | 'kickPenaltyPercentByReason'
  | 'kickValidatorInNextEpoch'
  | 'lockValidatorsForNextEpoch'
  | 'nextValidatorCountForConsensus'
  | 'nodeAddressToStakerAddress'
  | 'owner'
  | 'readyForNextEpoch'
  | 'renounceOwnership'
  | 'requestToJoin'
  | 'requestToLeave'
  | 'setConfig'
  | 'setContractResolver'
  | 'setEpochEndTime'
  | 'setEpochLength'
  | 'setEpochState'
  | 'setEpochTimeout'
  | 'setIpPortNodeAddressAndCommunicationPubKeys'
  | 'setKickPenaltyPercent'
  | 'shouldKickValidator'
  | 'signalReadyForNextEpoch'
  | 'stake'
  | 'stakeAndJoin'
  | 'state'
  | 'totalStaked'
  | 'transferOwnership'
  | 'unlockValidatorsForNextEpoch'
  | 'usedCommsKeys'
  | 'validators'
  | 'votesToKickValidatorsInNextEpoch'
  | 'withdraw';
export interface ConfigSetEventEmittedResponse {
  newTokenRewardPerTokenPerEpoch: BigNumberish;
  newComplaintTolerance: BigNumberish;
  newComplaintIntervalSecs: BigNumberish;
  newKeyTypes: BigNumberish[];
  newMinimumValidatorCount: BigNumberish;
}
export interface EpochEndTimeSetEventEmittedResponse {
  newEpochEndTime: BigNumberish;
}
export interface EpochLengthSetEventEmittedResponse {
  newEpochLength: BigNumberish;
}
export interface EpochTimeoutSetEventEmittedResponse {
  newEpochTimeout: BigNumberish;
}
export interface KickPenaltyPercentSetEventEmittedResponse {
  reason: BigNumberish;
  newKickPenaltyPercent: BigNumberish;
}
export interface OwnershipTransferredEventEmittedResponse {
  previousOwner: string;
  newOwner: string;
}
export interface ReadyForNextEpochEventEmittedResponse {
  staker: string;
  epochNumber: BigNumberish;
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
export interface RewardsDurationUpdatedEventEmittedResponse {
  newDuration: BigNumberish;
}
export interface StakingTokenSetEventEmittedResponse {
  newStakingTokenAddress: string;
}
export interface StateChangedEventEmittedResponse {
  newState: BigNumberish;
}
export interface ValidatorKickedFromNextEpochEventEmittedResponse {
  staker: string;
  amountBurned: BigNumberish;
}
export interface ValidatorRejoinedNextEpochEventEmittedResponse {
  staker: string;
}
export interface VotedToKickValidatorInNextEpochEventEmittedResponse {
  reporter: string;
  validatorStakerAddress: string;
  reason: BigNumberish;
  data: Arrayish;
}
export interface ConfigResponse {
  tokenRewardPerTokenPerEpoch: BigNumber;
  0: BigNumber;
  complaintTolerance: BigNumber;
  1: BigNumber;
  complaintIntervalSecs: BigNumber;
  2: BigNumber;
  minimumValidatorCount: BigNumber;
  3: BigNumber;
  length: 4;
}
export interface EpochResponse {
  epochLength: BigNumber;
  0: BigNumber;
  number: BigNumber;
  1: BigNumber;
  endTime: BigNumber;
  2: BigNumber;
  retries: BigNumber;
  3: BigNumber;
  timeout: BigNumber;
  4: BigNumber;
  length: 5;
}
export interface ValidatorResponse {
  ip: number;
  0: number;
  ipv6: BigNumber;
  1: BigNumber;
  port: number;
  2: number;
  nodeAddress: string;
  3: string;
  reward: BigNumber;
  4: BigNumber;
  senderPubKey: BigNumber;
  5: BigNumber;
  receiverPubKey: BigNumber;
  6: BigNumber;
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
  reward: BigNumber;
  4: BigNumber;
  senderPubKey: BigNumber;
  5: BigNumber;
  receiverPubKey: BigNumber;
  6: BigNumber;
  length: 7;
}
export interface Staking {
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: constructor
   * @param _resolver Type: address, Indexed: false
   * @param _keyTypes Type: uint256[], Indexed: false
   * @param _env Type: uint8, Indexed: false
   */
  'new'(
    _resolver: string,
    _keyTypes: BigNumberish[],
    _env: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
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
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param staker Type: address, Indexed: false
   */
  adminRejoinValidator(
    staker: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param validatorStakerAddress Type: address, Indexed: false
   * @param amountToPenalize Type: uint256, Indexed: false
   */
  adminSlashValidator(
    validatorStakerAddress: string,
    amountToPenalize: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  advanceEpoch(
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  config(overrides?: ContractCallOverrides): Promise<ConfigResponse>;
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
  countOfCurrentValidatorsReadyForNextEpoch(
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  countOfNextValidatorsReadyForNextEpoch(
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  currentValidatorCountForConsensus(
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
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
  epoch(overrides?: ContractCallOverrides): Promise<EpochResponse>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  exit(overrides?: ContractTransactionOverrides): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getKeyTypes(overrides?: ContractCallOverrides): Promise<BigNumber[]>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getKickedValidators(overrides?: ContractCallOverrides): Promise<string[]>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  getReward(
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getStakingBalancesAddress(overrides?: ContractCallOverrides): Promise<string>;
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
  getValidatorsInCurrentEpochLength(
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
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
   * @param addresses Type: address[], Indexed: false
   */
  getValidatorsStructs(
    addresses: string[],
    overrides?: ContractCallOverrides
  ): Promise<ValidatorResponse[]>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getValidatorsStructsInCurrentEpoch(
    overrides?: ContractCallOverrides
  ): Promise<ValidatorResponse[]>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getValidatorsStructsInNextEpoch(
    overrides?: ContractCallOverrides
  ): Promise<ValidatorResponse[]>;
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
   * @param account Type: address, Indexed: false
   */
  isActiveValidatorByNodeAddress(
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
   * @param parameter0 Type: uint256, Indexed: false
   */
  kickPenaltyPercentByReason(
    parameter0: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
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
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  lockValidatorsForNextEpoch(
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  nextValidatorCountForConsensus(
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
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
  ): Promise<ContractTransaction>;
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
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  requestToLeave(
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newTokenRewardPerTokenPerEpoch Type: uint256, Indexed: false
   * @param newComplaintTolerance Type: uint256, Indexed: false
   * @param newComplaintIntervalSecs Type: uint256, Indexed: false
   * @param newKeyTypes Type: uint256[], Indexed: false
   * @param newMinimumValidatorCount Type: uint256, Indexed: false
   */
  setConfig(
    newTokenRewardPerTokenPerEpoch: BigNumberish,
    newComplaintTolerance: BigNumberish,
    newComplaintIntervalSecs: BigNumberish,
    newKeyTypes: BigNumberish[],
    newMinimumValidatorCount: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
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
   * @param newEpochEndTime Type: uint256, Indexed: false
   */
  setEpochEndTime(
    newEpochEndTime: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
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
  ): Promise<ContractTransaction>;
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
  ): Promise<ContractTransaction>;
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
  ): Promise<ContractTransaction>;
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
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param reason Type: uint256, Indexed: false
   * @param newKickPenaltyPercent Type: uint256, Indexed: false
   */
  setKickPenaltyPercent(
    reason: BigNumberish,
    newKickPenaltyPercent: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
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
   * @param epochNumber Type: uint256, Indexed: false
   */
  signalReadyForNextEpoch(
    epochNumber: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
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
  ): Promise<ContractTransaction>;
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
  ): Promise<ContractTransaction>;
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
   */
  unlockValidatorsForNextEpoch(
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: bytes32, Indexed: false
   */
  usedCommsKeys(
    parameter0: Arrayish,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
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
  ): Promise<ContractTransaction>;
}
