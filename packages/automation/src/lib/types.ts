import { ethers } from 'ethers';

import { LitContracts } from '@lit-protocol/contracts-sdk';
import { LitNodeClient } from '@lit-protocol/lit-node-client';

import { BaseTransitionParams } from './transitions';

export type Address = `0x${string}`;
export type voidAsyncFunction = () => void;
export type onError = (error: unknown) => void;

export interface PKPInfo {
  tokenId: string;
  publicKey: string;
  ethAddress: string;
}

export interface OnEvmChain {
  evmChainId: ContextOrLiteral<number>;
}

export interface ContextAccess {
  contextPath: string;
}

export type ContextOrLiteral<T> = T | ContextAccess;

interface ContextUpdate extends ContextAccess {
  dataPath: string;
}

export interface UpdatesContext {
  contextUpdates: ContextUpdate[];
}

export interface LitActionStateDefinition {
  code?: ContextOrLiteral<string>;
  ipfsId?: ContextOrLiteral<string>;
  jsParams?: Record<string, unknown>;
}

export interface ContextStateDefinition {
  log?: {
    atEnter?: boolean;
    atExit?: boolean;
    path?: string;
  };
}

export interface TransactionStateDefinition extends OnEvmChain {
  contractABI: ethers.ContractInterface;
  contractAddress: ContextOrLiteral<Address>;
  method: ContextOrLiteral<string>;
  params?: ContextOrLiteral<any>[];
  value?: ContextOrLiteral<string>;
}

export interface MintStateDefinition {
  mint: boolean;
}

export interface usePkpStateDefinition {
  pkp: ContextOrLiteral<PKPInfo>;
}

export interface mintCapacityNFTStateDefinition extends MintStateDefinition {
  daysUntilUTCMidnightExpiration: number;
  requestPerSecond: number;
}

export interface useCapacityNFTStateDefinition {
  capacityTokenId: ContextOrLiteral<string>;
}

export interface StateDefinition {
  context?: ContextStateDefinition;
  key: string;
  litAction?: LitActionStateDefinition;
  transaction?: TransactionStateDefinition;
  transitions?: Omit<TransitionDefinition, 'fromState'>[];
  useCapacityNFT?:
    | useCapacityNFTStateDefinition
    | mintCapacityNFTStateDefinition;
  usePkp?: usePkpStateDefinition | MintStateDefinition;
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
  eventParams?: any[];
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
  onError?: (error: unknown, context?: string) => void;
  privateKey: string;
}

export interface StateMachineDefinition
  extends Omit<BaseStateMachineParams, 'litNodeClient' | 'litContracts'> {
  litNodeClient: LitNodeClient | ConstructorParameters<typeof LitNodeClient>[0];
  litContracts: LitContracts | ConstructorParameters<typeof LitContracts>[0];
  states: StateDefinition[];
  transitions?: TransitionDefinition[];
}

export interface TransitionParams
  extends Omit<BaseTransitionParams, 'onMatch'>,
    Partial<Pick<BaseTransitionParams, 'onMatch'>> {
  fromState: string;
  toState: string;
}
