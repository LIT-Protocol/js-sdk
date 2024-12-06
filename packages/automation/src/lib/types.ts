import { ethers } from 'ethers';

import { LitContracts } from '@lit-protocol/contracts-sdk';
import { LitNodeClient } from '@lit-protocol/lit-node-client';

import { BaseTransitionParams } from './transitions';

export type Address = `0x${string}`;

export type PKPInfo = {
  tokenId: string;
  publicKey: string;
  ethAddress: string;
};

export interface OnEvmChain {
  evmChainId: number;
}

export interface UsesPkp {
  pkpOwnerKey: string;
  pkpPublicKey: string;
  pkpEthAddress: Address;
}

export interface LitActionStateDefinition extends UsesPkp {
  ipfsId?: string; // TODO separate into another without code
  code: string;
  jsParams: Record<string, any>;
}

export interface TransactionStateDefinition extends UsesPkp, OnEvmChain {
  contractAddress: Address;
  contractABI: ethers.ContractInterface;
  method: string;
  value?: string;
  params?: any[];
}

export interface StateDefinition {
  key: string;
  litAction?: LitActionStateDefinition;
  transaction?: TransactionStateDefinition;
}

export interface IntervalTransitionDefinition {
  interval?: number;
}

export interface BaseBalanceTransitionDefinition
  extends IntervalTransitionDefinition,
    OnEvmChain {
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
  tokenAddress: Address;
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

export interface EvmContractEventTransitionDefinition extends OnEvmChain {
  contractAddress: Address;
  abi: ethers.ContractInterface; // TODO rename a contractABI
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
  privateKey?: string;
  pkp?: PKPInfo;
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
