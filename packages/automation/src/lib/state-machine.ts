import { ethers } from 'ethers';

import { LIT_EVM_CHAINS } from '@lit-protocol/constants';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { LitNodeClient } from '@lit-protocol/lit-node-client';

import {
  ContractEventData,
  EVMContractEventListener,
  Listener,
  TimerListener,
} from './listeners';
import { State, StateParams } from './states';
import { Check, Transition, BaseTransitionParams } from './transitions';

export interface BaseStateMachineParams {
  debug?: boolean;
  litNodeClient: LitNodeClient;
  litContracts: LitContracts;
}

export interface StateDefinition {
  key: string;
}

interface TimerTransitionDefinition {
  interval: number;
  offset: number;
  step: number;
  until: number;
}

interface EvmContractEventTransitionDefinition {
  evmChainId: number;
  contractAddress: string;
  abi: ethers.ContractInterface;
  eventName: string;
  eventParams?: any;
}

export interface TransitionDefinition {
  fromState: string;
  toState: string;
  timer?: TimerTransitionDefinition;
  evmContractEvent?: EvmContractEventTransitionDefinition;
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

    machineConfig.transitions.forEach((transition, index) => {
      const { fromState, toState, timer, evmContractEvent } = transition;

      const transitionConfig: TransitionParams = {
        fromState,
        toState,
      };

      const listeners: Listener<any>[] = [];
      const checks: Check[] = [];

      if (timer) {
        listeners.push(
          new TimerListener(timer.interval, timer.offset, timer.step)
        );
        checks.push(async (values) => values[index] === timer.until);
      }

      if (evmContractEvent) {
        const chain = Object.values(LIT_EVM_CHAINS).find(
          (chain) => chain.chainId === evmContractEvent.evmChainId
        );
        if (!chain) {
          throw new Error(
            `EVM chain with chainId ${evmContractEvent.evmChainId} not found`
          );
        }

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
          const eventData = values[index] as ContractEventData;
          return eventData.event.event === evmContractEvent.eventName;
        });
      }

      // Add all listeners to the transition
      transitionConfig.listeners = listeners;
      // Aggregate (AND) all listener checks to a single function result
      transitionConfig.check = async (values) =>
        Promise.all(checks.map((check) => check(values))).then((results) =>
          results.every((result) => result)
        );

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
