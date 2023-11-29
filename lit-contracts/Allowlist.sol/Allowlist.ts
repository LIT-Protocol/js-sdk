/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from 'ethers';
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from '@ethersproject/abi';
import type { Listener, Provider } from '@ethersproject/providers';
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from './common';

export interface AllowlistInterface extends utils.Interface {
  functions: {
    'addAdmin(address)': FunctionFragment;
    'allowAll()': FunctionFragment;
    'allowedItems(bytes32)': FunctionFragment;
    'isAllowed(bytes32)': FunctionFragment;
    'owner()': FunctionFragment;
    'removeAdmin(address)': FunctionFragment;
    'renounceOwnership()': FunctionFragment;
    'setAllowAll(bool)': FunctionFragment;
    'setAllowed(bytes32)': FunctionFragment;
    'setNotAllowed(bytes32)': FunctionFragment;
    'transferOwnership(address)': FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | 'addAdmin'
      | 'allowAll'
      | 'allowedItems'
      | 'isAllowed'
      | 'owner'
      | 'removeAdmin'
      | 'renounceOwnership'
      | 'setAllowAll'
      | 'setAllowed'
      | 'setNotAllowed'
      | 'transferOwnership'
  ): FunctionFragment;

  encodeFunctionData(functionFragment: 'addAdmin', values: [string]): string;
  encodeFunctionData(functionFragment: 'allowAll', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'allowedItems',
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: 'isAllowed',
    values: [BytesLike]
  ): string;
  encodeFunctionData(functionFragment: 'owner', values?: undefined): string;
  encodeFunctionData(functionFragment: 'removeAdmin', values: [string]): string;
  encodeFunctionData(
    functionFragment: 'renounceOwnership',
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: 'setAllowAll',
    values: [boolean]
  ): string;
  encodeFunctionData(
    functionFragment: 'setAllowed',
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: 'setNotAllowed',
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: 'transferOwnership',
    values: [string]
  ): string;

  decodeFunctionResult(functionFragment: 'addAdmin', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'allowAll', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'allowedItems',
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: 'isAllowed', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'owner', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'removeAdmin',
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: 'renounceOwnership',
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: 'setAllowAll',
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: 'setAllowed', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'setNotAllowed',
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: 'transferOwnership',
    data: BytesLike
  ): Result;

  events: {
    'AdminAdded(address)': EventFragment;
    'AdminRemoved(address)': EventFragment;
    'ItemAllowed(bytes32)': EventFragment;
    'ItemNotAllowed(bytes32)': EventFragment;
    'OwnershipTransferred(address,address)': EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: 'AdminAdded'): EventFragment;
  getEvent(nameOrSignatureOrTopic: 'AdminRemoved'): EventFragment;
  getEvent(nameOrSignatureOrTopic: 'ItemAllowed'): EventFragment;
  getEvent(nameOrSignatureOrTopic: 'ItemNotAllowed'): EventFragment;
  getEvent(nameOrSignatureOrTopic: 'OwnershipTransferred'): EventFragment;
}

export interface AdminAddedEventObject {
  newAdmin: string;
}
export type AdminAddedEvent = TypedEvent<[string], AdminAddedEventObject>;

export type AdminAddedEventFilter = TypedEventFilter<AdminAddedEvent>;

export interface AdminRemovedEventObject {
  newAdmin: string;
}
export type AdminRemovedEvent = TypedEvent<[string], AdminRemovedEventObject>;

export type AdminRemovedEventFilter = TypedEventFilter<AdminRemovedEvent>;

export interface ItemAllowedEventObject {
  key: string;
}
export type ItemAllowedEvent = TypedEvent<[string], ItemAllowedEventObject>;

export type ItemAllowedEventFilter = TypedEventFilter<ItemAllowedEvent>;

export interface ItemNotAllowedEventObject {
  key: string;
}
export type ItemNotAllowedEvent = TypedEvent<
  [string],
  ItemNotAllowedEventObject
>;

export type ItemNotAllowedEventFilter = TypedEventFilter<ItemNotAllowedEvent>;

export interface OwnershipTransferredEventObject {
  previousOwner: string;
  newOwner: string;
}
export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  OwnershipTransferredEventObject
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export interface Allowlist extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: AllowlistInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    addAdmin(
      newAdmin: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    allowAll(overrides?: CallOverrides): Promise<[boolean]>;

    allowedItems(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    isAllowed(key: BytesLike, overrides?: CallOverrides): Promise<[boolean]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    removeAdmin(
      newAdmin: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    setAllowAll(
      _allowAll: boolean,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    setAllowed(
      key: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    setNotAllowed(
      key: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;
  };

  addAdmin(
    newAdmin: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  allowAll(overrides?: CallOverrides): Promise<boolean>;

  allowedItems(arg0: BytesLike, overrides?: CallOverrides): Promise<boolean>;

  isAllowed(key: BytesLike, overrides?: CallOverrides): Promise<boolean>;

  owner(overrides?: CallOverrides): Promise<string>;

  removeAdmin(
    newAdmin: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  renounceOwnership(
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  setAllowAll(
    _allowAll: boolean,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  setAllowed(
    key: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  setNotAllowed(
    key: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  callStatic: {
    addAdmin(newAdmin: string, overrides?: CallOverrides): Promise<void>;

    allowAll(overrides?: CallOverrides): Promise<boolean>;

    allowedItems(arg0: BytesLike, overrides?: CallOverrides): Promise<boolean>;

    isAllowed(key: BytesLike, overrides?: CallOverrides): Promise<boolean>;

    owner(overrides?: CallOverrides): Promise<string>;

    removeAdmin(newAdmin: string, overrides?: CallOverrides): Promise<void>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    setAllowAll(_allowAll: boolean, overrides?: CallOverrides): Promise<void>;

    setAllowed(key: BytesLike, overrides?: CallOverrides): Promise<void>;

    setNotAllowed(key: BytesLike, overrides?: CallOverrides): Promise<void>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    'AdminAdded(address)'(newAdmin?: string | null): AdminAddedEventFilter;
    AdminAdded(newAdmin?: string | null): AdminAddedEventFilter;

    'AdminRemoved(address)'(newAdmin?: string | null): AdminRemovedEventFilter;
    AdminRemoved(newAdmin?: string | null): AdminRemovedEventFilter;

    'ItemAllowed(bytes32)'(key?: BytesLike | null): ItemAllowedEventFilter;
    ItemAllowed(key?: BytesLike | null): ItemAllowedEventFilter;

    'ItemNotAllowed(bytes32)'(
      key?: BytesLike | null
    ): ItemNotAllowedEventFilter;
    ItemNotAllowed(key?: BytesLike | null): ItemNotAllowedEventFilter;

    'OwnershipTransferred(address,address)'(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;
  };

  estimateGas: {
    addAdmin(
      newAdmin: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    allowAll(overrides?: CallOverrides): Promise<BigNumber>;

    allowedItems(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isAllowed(key: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    removeAdmin(
      newAdmin: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    setAllowAll(
      _allowAll: boolean,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    setAllowed(
      key: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    setNotAllowed(
      key: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addAdmin(
      newAdmin: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    allowAll(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    allowedItems(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isAllowed(
      key: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    removeAdmin(
      newAdmin: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    setAllowAll(
      _allowAll: boolean,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    setAllowed(
      key: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    setNotAllowed(
      key: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;
  };
}
