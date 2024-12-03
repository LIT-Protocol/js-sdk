import { ethers } from 'ethers';

import { LitContracts } from '@lit-protocol/contracts-sdk';
import { LitNodeClient } from '@lit-protocol/lit-node-client';

import {
  ContractEventData,
  EVMContractEventListener,
  IntervalListener,
  Listener,
  TimerListener,
} from './listeners';
import { State, StateParams } from './states';
import { Check, Transition } from './transitions';
import { getChain } from './utils/chain';
import { getBalanceTransitionCheck, getERC20Balance } from './utils/erc20';

import type {
  Address,
  BalanceTransitionDefinition,
  BaseBalanceTransitionDefinition,
  BaseStateMachineParams,
  ERC20BalanceTransitionDefinition,
  EvmContractEventTransitionDefinition,
  IntervalTransitionDefinition,
  NativeBalanceTransitionDefinition,
  OnEvmChainEvent,
  StateDefinition,
  StateMachineDefinition,
  TimerTransitionDefinition,
  TransitionDefinition,
  TransitionParams,
} from './types';

export type MachineStatus = 'running' | 'stopped';

/**
 * A StateMachine class that manages states and transitions between them.
 */
export class StateMachine {
  private debug = false;

  private litNodeClient: LitNodeClient;
  private litContracts: LitContracts;

  public id: string;
  public status: MachineStatus = 'stopped';
  private states = new Map<string, State>();
  private transitions = new Map<string, Map<string, Transition>>();
  private currentState?: State;
  private onStopCallback?: () => Promise<void>;

  constructor(params: BaseStateMachineParams) {
    this.id = this.generateId();
    this.debug = params.debug ?? false;

    this.litNodeClient = params.litNodeClient;
    this.litContracts = params.litContracts;
  }

  static fromDefinition(machineConfig: StateMachineDefinition): StateMachine {
    const { litNodeClient, litContracts = {} } = machineConfig;

    const litNodeClientInstance =
      'connect' in litNodeClient
        ? litNodeClient
        : new LitNodeClient(litNodeClient);
    const litContractsInstance =
      'connect' in litContracts ? litContracts : new LitContracts(litContracts);

    if (
      litNodeClientInstance.config.litNetwork !== litContractsInstance.network
    ) {
      throw new Error(
        'litNodeClient and litContracts should not use different networks'
      );
    }

    const stateMachine = new StateMachine({
      debug: machineConfig.debug,
      litNodeClient: litNodeClientInstance,
      litContracts: litContractsInstance,
    });

    machineConfig.states.forEach((state) => {
      stateMachine.addState(state);
    });

    machineConfig.transitions.forEach((transition) => {
      const { balances, evmContractEvent, fromState, timer, toState } =
        transition;

      const transitionConfig: TransitionParams = {
        fromState,
        toState,
      };

      const listeners: Listener<any>[] = [];
      const checks: Check[] = [];

      if (timer) {
        const transitionIndex = checks.length;
        listeners.push(
          new TimerListener(timer.interval, timer.offset, timer.step)
        );
        checks.push(async (values) => values[transitionIndex] === timer.until);
      }

      if (evmContractEvent) {
        const transitionIndex = checks.length;
        const chain = getChain(evmContractEvent);

        listeners.push(
          new EVMContractEventListener(
            chain.rpcUrls[0],
            {
              address: evmContractEvent.contractAddress,
              abi: evmContractEvent.abi,
            },
            {
              name: evmContractEvent.eventName,
              filter: evmContractEvent.eventParams,
            }
          )
        );
        checks.push(async (values) => {
          const eventData = values[transitionIndex] as
            | ContractEventData
            | undefined;
          return eventData?.event.event === evmContractEvent.eventName;
        });
      }

      if (balances) {
        balances.forEach((balance) => {
          const transitionIndex = checks.length;
          const chain = getChain(balance);

          const chainProvider = new ethers.providers.JsonRpcProvider(
            chain.rpcUrls[0],
            chain.chainId
          );

          switch (balance.type) {
            case 'native':
              listeners.push(
                new IntervalListener(
                  () => chainProvider.getBalance(balance.address),
                  balance.interval
                )
              );
              checks.push(getBalanceTransitionCheck(transitionIndex, balance));
              break;
            case 'ERC20':
              listeners.push(
                new IntervalListener(
                  () =>
                    getERC20Balance(
                      chainProvider,
                      balance.tokenAddress,
                      balance.tokenDecimals,
                      balance.address
                    ),
                  balance.interval
                )
              );
              checks.push(getBalanceTransitionCheck(transitionIndex, balance));
              break;
            // case 'ERC721':
            // case 'ERC1155':
            default:
              throw new Error(
                `TODO balance check type ${balance['type']} unknown or not yet implemented`
              );
          }
        });
      }

      // Add all listeners to the transition
      transitionConfig.listeners = listeners;
      // Aggregate (AND) all listener checks to a single function result
      transitionConfig.check = async (values) => {
        console.log(
          `${transition.fromState} -> ${transition.toState} values`,
          values
        );
        return Promise.all(checks.map((check) => check(values))).then(
          (results) => {
            console.log(
              `${transition.fromState} -> ${transition.toState} results`,
              results
            );
            return results.every((result) => result);
          }
        );
      };

      stateMachine.addTransition(transitionConfig);
    });

    return stateMachine;
  }

  get isRunning() {
    return this.status === 'running';
  }

  /**
   * Adds a state to the state machine.
   * @param params The parameters for the state.
   */
  addState(params: StateParams) {
    const state = new State(params);
    this.states.set(state.key, state);
    if (!this.transitions.has(state.key)) {
      this.transitions.set(state.key, new Map<string, Transition>());
    }
  }

  /**
   * Adds a transition between two states.
   * @param params The parameters for the transition.
   */
  addTransition({
    fromState,
    toState,
    listeners,
    check,
    onMatch,
    onMismatch,
  }: TransitionParams) {
    if (!this.states.has(fromState)) {
      throw new Error(`Source state ${fromState} not found`);
    }
    if (!this.states.has(toState)) {
      throw new Error(`Target state ${toState} not found`);
    }

    const transitioningOnMatch = async (values: (unknown | undefined)[]) => {
      await onMatch?.(values);
      await this.transitionTo(toState);
    };

    const transition = new Transition({
      debug: this.debug,
      listeners,
      check,
      onMatch: transitioningOnMatch,
      onMismatch,
    });

    const stateTransitions =
      this.transitions.get(fromState) ?? new Map<string, Transition>();
    stateTransitions.set(toState, transition);
    this.transitions.set(fromState, stateTransitions);
  }

  /**
   * Starts the state machine with the given initial state.
   * @param initialState The key of the initial state.
   * @param onStop Optional callback to execute when the machine is stopped.
   */
  async startMachine(initialState: string, onStop?: () => Promise<void>) {
    this.debug && console.log('Starting state machine...');

    await Promise.all([
      this.litContracts.connect(),
      this.litNodeClient.connect(),
    ]);

    this.onStopCallback = onStop;
    await this.enterState(initialState);
    this.status = 'running';

    this.debug && console.log('State machine started');
  }

  /**
   * Stops the state machine by exiting the current state and not moving to another one.
   */
  async stopMachine() {
    this.debug && console.log('Stopping state machine...');

    await this.exitCurrentState();
    await this.onStopCallback?.();
    this.status = 'stopped';

    this.debug && console.log('State machine stopped');
  }

  /**
   * Stops listening on the current state's transitions and exits the current state.
   */
  private async exitCurrentState() {
    if (!this.isRunning) {
      return;
    }

    this.debug && console.log('exitCurrentState', this.currentState?.key);

    const currentTransitions =
      this.transitions.get(this.currentState?.key ?? '') ??
      new Map<string, Transition>();
    await Promise.all(
      Array.from(currentTransitions.values()).map((t) => t.stopListening())
    );
    await this.currentState?.exit();
    this.currentState = undefined;
  }

  /**
   * Moves to a new state.
   * @param stateKey The key of the new state.
   */
  private async enterState(stateKey: string) {
    const state = this.states.get(stateKey);
    if (!state) {
      throw new Error(`State ${stateKey} not found`);
    }
    this.debug && console.log('enterState', state.key);
    await state.enter();
    const nextTransitions =
      this.transitions.get(state.key) ?? new Map<string, Transition>();
    await Promise.all(
      Array.from(nextTransitions.values()).map((t) => t.startListening())
    );
    this.currentState = state;
  }

  /**
   * Triggers a transition to a new state.
   * @param stateKey The key of the target state.
   */
  private async transitionTo(stateKey: string) {
    const nextState = this.states.get(stateKey);

    if (!nextState) {
      throw new Error(`State ${stateKey} not found`);
    }
    if (this.currentState === nextState) {
      console.warn(`State ${stateKey} is already active. Skipping transition.`);
      return;
    }

    try {
      // Machine consumer can call stopMachine() while we are in the middle of a transition
      this.isRunning && (await this.exitCurrentState());
      this.isRunning && (await this.enterState(stateKey));
    } catch (e) {
      this.currentState = undefined;
      throw new Error(`Could not enter state ${stateKey}`);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2);
  }
}
