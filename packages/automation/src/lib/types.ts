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
  evmChainId: ContextOrLiteral<number>;
}

export interface ReadsContext<T> {
  contextPath: string;
}

export type ContextOrLiteral<T> = T | ReadsContext<T>;

interface ContextUpdate extends ReadsContext<unknown> {
  dataPath: string;
}

export interface UpdatesContext {
  contextUpdates: ContextUpdate[];
}

export interface UsesPkp {
  pkpOwnerKey: ContextOrLiteral<string>;
  pkpPublicKey: ContextOrLiteral<string>;
  pkpEthAddress: ContextOrLiteral<Address>;
}

interface LitActionStateDefinition extends UsesPkp {
  code?: ContextOrLiteral<string>;
  ipfsId?: ContextOrLiteral<string>;
  jsParams?: Record<string, any>;
}

export interface ContextStateDefinition {
  log?: {
    atEnter?: boolean;
    atExit?: boolean;
    path?: string;
  };
}

export interface TransactionStateDefinition extends UsesPkp, OnEvmChain {
  contractABI: ethers.ContractInterface;
  contractAddress: ContextOrLiteral<Address>;
  method: ContextOrLiteral<string>;
  params?: ContextOrLiteral<any>[];
  value?: ContextOrLiteral<string>;
}

export interface StateDefinition {
  context?: ContextStateDefinition;
  key: string;
  litAction?: LitActionStateDefinition;
  transaction?: TransactionStateDefinition;
  transitions?: Omit<TransitionDefinition, 'fromState'>[];
}

export interface IntervalTransitionDefinition {
  interval?: number;
}

export interface BaseBalanceTransitionDefinition
  extends IntervalTransitionDefinition,
    OnEvmChain {
  address: Address;
  amount: string;
  comparator: '>' | '>=' | '=' | '!=' | '<=' | '<';
}

export interface NativeBalanceTransitionDefinition
  extends BaseBalanceTransitionDefinition {
  type: 'native';
}

export interface ERC20BalanceTransitionDefinition
  extends BaseBalanceTransitionDefinition {
  tokenAddress: Address;
  tokenDecimals: number;
  type: 'ERC20';
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

export interface EvmContractEventTransitionDefinition
  extends OnEvmChain,
    UpdatesContext {
  contractABI: ethers.ContractInterface;
  contractAddress: Address;
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
  context?: Record<string, any>;
  debug?: boolean;
  litContracts: LitContracts;
  litNodeClient: LitNodeClient;
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
