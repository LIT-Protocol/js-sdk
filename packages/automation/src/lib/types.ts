import { ethers } from 'ethers';

import { LitContracts } from '@lit-protocol/contracts-sdk';
import { LitNodeClient } from '@lit-protocol/lit-node-client';

import { BaseTransitionParams } from './transitions';

export type Address = `0x${string}`;

export interface LitActionStateDefinition {
  pkpOwnerKey: string;
  pkpPublicKey: string;
  ipfsId?: string; // TODO separate into another without code
  code: string;
  jsParams: Record<string, any>;
}

export interface StateDefinition {
  key: string;
  litAction?: LitActionStateDefinition;
}

export interface OnEvmChainEvent {
  evmChainId: number;
}

export interface IntervalTransitionDefinition {
  interval?: number;
}

export interface BaseBalanceTransitionDefinition
  extends IntervalTransitionDefinition,
    OnEvmChainEvent {
  address: Address;
  comparator: '>' | '>=' | '=' | '!=' | '<=' | '<';
  amount: string;
}

export interface NativeBalanceTransitionDefinition
  extends BaseBalanceTransitionDefinition {
  type: 'native';
}

export interface ERC20BalanceTransitionDefinition
  extends BaseBalanceTransitionDefinition {
  type: 'ERC20';
  tokenAddress: string;
  tokenDecimals: number;
}

// TODO add ERC721 and ERC1155
export type BalanceTransitionDefinition =
  | NativeBalanceTransitionDefinition
  | ERC20BalanceTransitionDefinition;

export interface TimerTransitionDefinition
  extends IntervalTransitionDefinition {
  offset?: number;
  step?: number;
  until: number;
}

export interface EvmContractEventTransitionDefinition extends OnEvmChainEvent {
  contractAddress: string;
  abi: ethers.ContractInterface;
  eventName: string;
  eventParams?: any;
}

export interface TransitionDefinition {
  balances?: BalanceTransitionDefinition[];
  evmContractEvent?: EvmContractEventTransitionDefinition;
  fromState: string;
  timer?: TimerTransitionDefinition;
  toState: string;
}

export interface BaseStateMachineParams {
  debug?: boolean;
  litNodeClient: LitNodeClient;
  litContracts: LitContracts;
}

export interface StateMachineDefinition
  extends Omit<BaseStateMachineParams, 'litNodeClient' | 'litContracts'> {
  litNodeClient: LitNodeClient | ConstructorParameters<typeof LitNodeClient>[0];
  litContracts: LitContracts | ConstructorParameters<typeof LitContracts>[0];
  states: StateDefinition[];
  transitions: TransitionDefinition[];
}

export interface TransitionParams
  extends Omit<BaseTransitionParams, 'onMatch'>,
    Partial<Pick<BaseTransitionParams, 'onMatch'>> {
  fromState: string;
  toState: string;
}
