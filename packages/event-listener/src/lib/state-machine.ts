import { ethers } from 'ethers';

import {
  AutomationError,
  RPC_URL_BY_NETWORK,
  UnknownError,
} from '@lit-protocol/constants';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { logger } from '@lit-protocol/logger';

import { Action, ACTION_REPOSITORY } from './actions';
import { MachineContext } from './context/machine-context';
import {
  ContractEventData,
  EVMContractEventListener,
  IntervalListener,
  Listener,
  TimerListener,
} from './listeners';
import { State, StateParams } from './states';
import { CheckFn, Transition } from './transitions';
import {
  ActionConstructor,
  ActionDefinition,
  BaseStateMachineParams,
  ContextOrLiteral,
  StateDefinition,
  StateMachineDefinition,
  TransitionDefinition,
  TransitionParams,
  voidAsyncFunction,
} from './types';
import { getEvmChain } from './utils/chain';
import { getBalanceTransitionCheck, getERC20Balance } from './utils/erc20';

export type MachineStatus = 'running' | 'stopped';

export const StateMachineInitialContext = Object.freeze({
  activeCapacityTokenId: undefined,
  activePkp: undefined,
});

/**
 * A StateMachine class that manages states and transitions between them.
 */
export class StateMachine {
  private readonly debug;
  private readonly onError?: (error: unknown, context?: string) => void;
  private context: MachineContext;

  public readonly litNodeClient: LitNodeClient;
  private readonly privateKey?: string;
  public litContracts: LitContracts;

  public id: string;
  public status: MachineStatus = 'stopped';
  private readonly actionsRepository: Record<string, ActionConstructor>;
  private states = new Map<string, State>();
  private transitions = new Map<string, Map<string, Transition>>();
  private currentState?: State;
  private onStopCallback?: voidAsyncFunction;

  constructor(params: BaseStateMachineParams) {
    this.id = this.generateId();
    this.debug = params.debug ?? false;
    this.onError = params.onError;
    this.context = new MachineContext({
      ...StateMachineInitialContext,
      ...params.context,
    });

    this.actionsRepository = {
      ...ACTION_REPOSITORY,
      ...params.actionRepository,
    };
    this.litNodeClient = params.litNodeClient;
    this.litContracts = params.litContracts;
    this.privateKey = params.privateKey;
  }

  static fromDefinition(machineConfig: StateMachineDefinition): StateMachine {
    const {
      debug = false,
      context,
      onError,
      litContracts = {},
      litNodeClient,
      privateKey,
      states = [],
      transitions = [],
    } = machineConfig;

    // Create litNodeClient and litContracts instances
    const litNodeClientInstance =
      'connect' in litNodeClient
        ? litNodeClient
        : new LitNodeClient(litNodeClient);
    const litContractsInstance =
      'connect' in litContracts
        ? litContracts
        : new LitContracts({
            privateKey,
            ...litContracts,
          });

    if (
      litNodeClientInstance.config.litNetwork !== litContractsInstance.network
    ) {
      throw new AutomationError(
        {
          info: {
            litNodeClientNetwork: litNodeClientInstance.config.litNetwork,
            litContractsNetwork: litContractsInstance.network,
          },
        },
        'litNodeClient and litContracts should not use different networks'
      );
    }

    const stateMachine = new StateMachine({
      debug,
      context,
      litNodeClient: litNodeClientInstance,
      litContracts: litContractsInstance,
      privateKey,
      onError,
      actionRepository: {
        ...ACTION_REPOSITORY,
        ...machineConfig.actionRepository,
      },
    });

    const stateTransitions = [] as TransitionDefinition[];
    states.forEach((stateDefinition) => {
      const transitions = stateDefinition.transitions || [];
      stateTransitions.push(
        ...transitions.map((transition) => ({
          ...transition,
          fromState: stateDefinition.key,
        }))
      );

      stateMachine.addStateFromDefinition(stateDefinition);
    });

    [...stateTransitions, ...transitions].forEach((transition) => {
      stateMachine.addTransitionFromDefinition(transition);
    });

    return stateMachine;
  }

  /**
   * Indicates if the state machine is running
   */
  get isRunning(): boolean {
    return this.status === 'running';
  }

  /**
   * Returns an ethers Wallet the state machine can use
   */
  get signer(): ethers.Wallet {
    if (!this.privateKey) {
      throw new AutomationError(
        {
          info: {},
        },
        `Cannot use state machine signer without a private key. Pass a PK to the machine when creating it`
      );
    }

    return new ethers.Wallet(
      this.privateKey,
      new ethers.providers.JsonRpcProvider(
        RPC_URL_BY_NETWORK[this.litNodeClient.config.litNetwork]
      )
    );
  }

  /**
   * Adds a custom state to the state machine.
   * @param params The parameters for the state.
   */
  addState(params: StateParams): void {
    const state = new State(params);
    this.states.set(state.key, state);
    if (!this.transitions.has(state.key)) {
      this.transitions.set(state.key, new Map<string, Transition>());
    }
  }

  /**
   * Adds a state to the state machine using the declarative interface.
   * @param stateDefinition The state definition.
   */
  addStateFromDefinition(stateDefinition: StateDefinition): void {
    const stateParams: StateParams = {
      key: stateDefinition.key,
      debug: this.debug,
    };

    // Merge all state actions
    const { actions = [] } = stateDefinition;
    stateParams.onEnter = this.mergeActions(actions);

    this.addState(stateParams);
  }

  /**
   * Adds a transition between two states.
   * @param params The parameters for the transition.
   */
  addTransition({
    actions = [],
    fromState,
    toState,
    listeners,
    check,
    onMatch,
    onMismatch,
  }: TransitionParams): void {
    if (!this.states.has(fromState)) {
      throw new AutomationError(
        {
          info: {
            machineId: this.id,
            fromState: fromState,
            toState: toState,
          },
        },
        `Source state ${fromState} not found`
      );
    }
    if (!this.states.has(toState)) {
      throw new AutomationError(
        {
          info: {
            machineId: this.id,
            fromState: fromState,
            toState: toState,
          },
        },
        `Target state ${toState} not found`
      );
    }

    const transitioningOnMatch = async (values: (unknown | undefined)[]) => {
      await this.mergeActions(actions)();
      await onMatch?.(values);
      await this.transitionTo(toState);
    };

    const onTransitionError = async (error: unknown) => {
      this.handleError(error, `Error at ${fromState} -> ${toState} transition`);
    };

    const transition = new Transition({
      debug: this.debug,
      listeners,
      check,
      onError: onTransitionError,
      onMatch: transitioningOnMatch,
      onMismatch,
    });

    const stateTransitions =
      this.transitions.get(fromState) ?? new Map<string, Transition>();
    stateTransitions.set(toState, transition);
    this.transitions.set(fromState, stateTransitions);
  }

  addTransitionFromDefinition(transitionDefinition: TransitionDefinition) {
    const { actions, balances, evmContractEvent, fromState, timer, toState } =
      transitionDefinition;

    const transitionConfig: TransitionParams = {
      actions,
      fromState,
      toState,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Listeners can be any type
    const listeners: Listener<any>[] = [];
    const checks: CheckFn[] = [];

    if (timer) {
      const transitionIndex = checks.length;
      listeners.push(
        new TimerListener(timer.interval, timer.offset, timer.step)
      );
      checks.push(async (values) => values[transitionIndex] === timer.until);
    }

    if (evmContractEvent) {
      const transitionIndex = checks.length;
      const chainId = this.resolveContextPathOrLiteral(
        evmContractEvent.evmChainId
      );
      const chain = getEvmChain(chainId);

      listeners.push(
        new EVMContractEventListener(
          chain.rpcUrls[0],
          {
            address: evmContractEvent.contractAddress,
            abi: evmContractEvent.contractABI,
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

        evmContractEvent.contextUpdates?.forEach((contextUpdate) =>
          this.context.setFromData(
            contextUpdate.contextPath,
            eventData as Record<string, unknown> | undefined,
            contextUpdate.dataPath
          )
        );

        return eventData?.event.event === evmContractEvent.eventName;
      });
    }

    if (balances) {
      balances.forEach((balance) => {
        const transitionIndex = checks.length;
        const chainId = this.resolveContextPathOrLiteral(balance.evmChainId);
        const chain = getEvmChain(chainId);

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
            throw new AutomationError(
              {
                info: {
                  machineId: this.id,
                  balance,
                },
              },
              `TODO balance check type ${balance['type']} unknown or not yet implemented`
            );
        }
      });
    }

    // Add all listeners to the transition
    transitionConfig.listeners = listeners;
    // Aggregate (AND) all listener checks to a single function result
    transitionConfig.check = async (values) => {
      this.debug &&
        logger.info({
          msg: `${transitionDefinition.fromState} -> ${transitionDefinition.toState} values`,
          values,
        });
      return Promise.all(checks.map((check) => check(values))).then(
        (results) => {
          this.debug &&
            logger.info({
              msg: `${transitionDefinition.fromState} -> ${transitionDefinition.toState} results`,
              results,
            });
          return results.every((result) => result);
        }
      );
    };

    this.addTransition(transitionConfig);
  }

  /**
   * Starts the state machine with the given initial state.
   * @param initialState The key of the initial state.
   * @param onStop Optional callback to execute when the machine is stopped.
   */
  async startMachine(
    initialState: string,
    onStop?: voidAsyncFunction
  ): Promise<void> {
    this.debug && logger.info('Starting state machine...');

    await Promise.all([
      this.litContracts.connect(),
      this.litNodeClient.connect(),
    ]);

    this.onStopCallback = onStop;
    await this.enterState(initialState);
    this.status = 'running';

    this.debug && logger.info('State machine started');
  }

  /**
   * Gets a value from the machine context
   * If value or path do not exist it returns undefined
   * @param path the context path to read
   */
  public getFromContext<T>(path?: string | string[]): T {
    return this.context.get<T>(path);
  }

  /**
   * Resolves a value from the context if it specifies a path or returns it as a literal
   * @param value the literal value or read context object
   */
  public resolveContextPathOrLiteral<T = unknown>(
    value: ContextOrLiteral<T> | T
  ): T {
    if (value && typeof value === 'object' && 'contextPath' in value) {
      return this.context.get<T>(value.contextPath);
    }
    return value;
  }

  /**
   * Sets a value in the machine context
   * If path does not exist, it is created
   * @param path the context path to write
   * @param value the value to write in the context path
   */
  public setToContext(path: string | string[], value: unknown): void {
    this.context.set(path, value);
  }

  /**
   * Pushes a value in the machine context. The value will be converted to an array if it is not
   * If path does not exist, it is created
   * @param path the context path to write
   * @param value the value to write in the context path
   */
  public pushToContext(path: string | string[], value: unknown): void {
    this.context.push(path, value);
  }

  /**
   * Stops the state machine by exiting the current state and not moving to another one.
   */
  public async stopMachine(): Promise<void> {
    this.debug && logger.info('Stopping state machine...');

    this.status = 'stopped';
    await this.exitCurrentState();
    await this.onStopCallback?.();

    this.debug && logger.info('State machine stopped');
  }

  /**
   * Stops listening on the current state's transitions and exits the current state.
   */
  private async exitCurrentState(): Promise<void> {
    this.debug &&
      logger.info({ msg: 'exitCurrentState', state: this.currentState?.key });

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
  private async enterState(stateKey: string): Promise<void> {
    const state = this.states.get(stateKey);
    if (!state) {
      throw new AutomationError(
        {
          info: {
            machineId: this.id,
            state: stateKey,
            currentState: this.currentState,
            isRunning: this.isRunning,
          },
        },
        `State ${stateKey} not found`
      );
    }
    this.debug && logger.info({ msg: 'enterState', state: state.key });
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
  private async transitionTo(stateKey: string): Promise<void> {
    const nextState = this.states.get(stateKey);

    if (!nextState) {
      throw new UnknownError(
        {
          machineId: this.id,
          currentState: this.currentState,
          nextState: stateKey,
        },
        `Machine next state not found`
      );
    }
    if (this.currentState === nextState) {
      logger.warn(
        `State ${stateKey} is already active. Skipping state change.`
      );
      return;
    }

    try {
      // Machine consumer can call stopMachine() while we are in the middle of a transition
      this.isRunning && (await this.exitCurrentState());
      this.isRunning && (await this.enterState(stateKey));
    } catch (e) {
      this.currentState = undefined;
      this.handleError(e, `Could not enter state ${stateKey}`);
    }
  }

  /**
   * Merges the given action definitions into a single function that executes all actions concurrently.
   * @param actionDefinitions
   * @returns A function that executes all actions concurrently.
   * @private
   */
  private mergeActions(
    actionDefinitions: ActionDefinition[]
  ): voidAsyncFunction {
    const actions = [] as Action[];

    for (const action of actionDefinitions) {
      const ActionCtor = this.actionsRepository[action.key];
      if (!ActionCtor) {
        throw new AutomationError(
          { info: { action } },
          `Action key "${action.key}" not found in action repository`
        );
      }
      actions.push(
        new ActionCtor({ debug: this.debug, stateMachine: this, ...action })
      );
    }

    return async () => {
      await Promise.all(actions.map((action) => action.run())).catch((err) => {
        this.handleError(err, `Error running actions. Check details.`);
      });
    };
  }

  /**
   * Handles errors in the state machine.
   * @param error
   * @param context
   * @private
   */
  private handleError(error: unknown, context: string): void {
    // Try to halt machine if it is still running
    if (this.isRunning) {
      const publicError = new AutomationError(
        {
          info: {
            stateMachineId: this.id,
            status: this.status,
            currentState: this.currentState,
          },
          cause: error,
        },
        context ?? 'Error running state machine'
      );
      if (this.onError) {
        this.onError(publicError);
      } else {
        // This throw will likely crash the server
        throw publicError;
      }

      // Throwing when stopping could hide above error
      this.stopMachine().catch((error) => logger.error({ error }));
    }
  }

  /**
   * Generates a unique identifier for the state machine.
   * @returns A unique identifier string.
   * @private
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2);
  }
}
