import { ethers } from 'ethers';

import { LitContracts } from '@lit-protocol/contracts-sdk';
import { LitNodeClient } from '@lit-protocol/lit-node-client';

import { Action, ActionParams } from './actions/action';
import { BaseTransitionParams } from './transitions';

export type Address = `0x${string}`;
export type voidAsyncFunction = () => Promise<void>;
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

// Context Types
export type ContextOrLiteral<T> = T | ContextAccess;

interface ContextUpdate extends ContextAccess {
  dataPath: string;
}

export interface UpdatesContext {
  contextUpdates?: ContextUpdate[];
}

// Action Types
export type ActionConstructor = new (params: any) => Action;

export interface RawActionDefinition {
  key: string;
  [actionProperty: string]: unknown;
}

export interface LitActionActionDefinition {
  key: 'litAction';
  code?: ContextOrLiteral<string>;
  ipfsId?: ContextOrLiteral<string>;
  jsParams?: Record<string, unknown>;
}

export interface ContextActionDefinition {
  key: 'context';
  log?: {
    path: string;
  };
}

interface TransactionActionBaseDefinition extends OnEvmChain {
  key: 'transaction';
  contractAddress: ContextOrLiteral<Address>;
  value?: ContextOrLiteral<string>;
}

interface TransactionActionWithoutDataDefinition
  extends TransactionActionBaseDefinition {
  contractABI: ethers.ContractInterface;
  method: ContextOrLiteral<string>;
  params?: ContextOrLiteral<unknown> | ContextOrLiteral<unknown>[];
}

interface TransactionActionWithDataDefinition
  extends TransactionActionBaseDefinition {
  data?: ContextOrLiteral<string>;
}

export type TransactionActionDefinition =
  | TransactionActionWithoutDataDefinition
  | TransactionActionWithDataDefinition;

export interface MintActionDefinition {
  mint: true;
}

export interface MintPkpActionDefinition extends MintActionDefinition {
  key: 'usePkp';
}

export interface MintCapacityNFTActionDefinition extends MintActionDefinition {
  key: 'useCapacityNFT';
  daysUntilUTCMidnightExpiration: number;
  requestPerSecond: number;
}

export interface UsePkpActionDefinition {
  key: 'usePkp';
  pkp: ContextOrLiteral<PKPInfo>;
}

export interface UseCapacityNFTActionDefinition {
  key: 'useCapacityNFT';
  capacityTokenId: ContextOrLiteral<string>;
}

export type ActionDefinition =
  | RawActionDefinition
  | ContextActionDefinition
  | LitActionActionDefinition
  | MintCapacityNFTActionDefinition
  | MintPkpActionDefinition
  | TransactionActionDefinition
  | UseCapacityNFTActionDefinition
  | UsePkpActionDefinition;

// State Types
export interface StateDefinition {
  key: string;
  actions?: ActionDefinition[];
  transitions?: Omit<TransitionDefinition, 'fromState'>[];
}

// Transition Types
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
  eventParams?: unknown[];
}

export interface TransitionDefinition {
  balances?: BalanceTransitionDefinition[];
  evmContractEvent?: EvmContractEventTransitionDefinition;
  fromState: string;
  timer?: TimerTransitionDefinition;
  toState: string;
  actions?: ActionDefinition[];
}

export interface TransitionParams
  extends Omit<BaseTransitionParams, 'onMatch'>,
    Partial<Pick<BaseTransitionParams, 'onMatch'>> {
  actions?: ActionDefinition[];
  fromState: string;
  toState: string;
}

// Machine Types
export interface BaseStateMachineParams {
  actionRepository?: Record<string, ActionConstructor>;
  context?: Record<string, unknown>;
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
