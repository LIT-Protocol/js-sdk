import { ethers } from 'ethers';

import {
  AutomationError,
  UnknownError,
  RPC_URL_BY_NETWORK,
} from '@lit-protocol/constants';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { LitNodeClient } from '@lit-protocol/lit-node-client';

import {
  Action,
  LitActionAction,
  LogContextAction,
  MintCapacityCreditAction,
  MintPkpAction,
  TransactionAction,
} from './actions';
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
  BaseStateMachineParams,
  ContextOrLiteral,
  StateDefinition,
  StateMachineDefinition,
  TransitionDefinition,
  TransitionParams,
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
  private states = new Map<string, State>();
  private transitions = new Map<string, Map<string, Transition>>();
  private currentState?: State;
  private onStopCallback?: () => Promise<void>;

  constructor(params: BaseStateMachineParams) {
    this.id = this.generateId();
    this.debug = params.debug ?? false;
    this.onError = params.onError;
    this.context = new MachineContext({
      ...StateMachineInitialContext,
      ...params.context,
    });

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
  get isRunning() {
    return this.status === 'running';
  }

  /**
   * Returns an ethers Wallet the state machine can use
   */
  get signer() {
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
  addState(params: StateParams) {
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
  addStateFromDefinition(stateDefinition: StateDefinition) {
    const stateParams: StateParams = {
      key: stateDefinition.key,
      debug: this.debug,
    };

    const onEnterActions = [] as Action[];
    const onExitActions = [] as Action[];

    const { actions = [] } = stateDefinition;

    actions.forEach((action) => {
      switch (action.key) {
        case 'context':
          if (action.log?.path) {
            onEnterActions.push(
              new LogContextAction({
                debug: this.debug,
                stateMachine: this,
                path: action.log.path,
              })
            );
          }
          break;
        case 'litAction':
          onEnterActions.push(
            new LitActionAction({
              debug: this.debug,
              stateMachine: this,
              ...action,
            })
          );
          break;
        case 'transaction':
          onEnterActions.push(
            new TransactionAction({
              debug: this.debug,
              stateMachine: this,
              ...action,
            })
          );
          break;
        case 'useCapacityNFT':
          if ('capacityTokenId' in action) {
            this.context.set(
              'activeCapacityTokenId',
              this.resolveContextPathOrLiteral(action.capacityTokenId)
            );
          } else if ('mint' in action) {
            const mintCapacityCreditAction = new MintCapacityCreditAction({
              daysUntilUTCMidnightExpiration:
                action.daysUntilUTCMidnightExpiration,
              debug: this.debug,
              requestPerSecond: action.requestPerSecond,
              stateMachine: this,
            });
            onEnterActions.push(mintCapacityCreditAction);
          }
          if (this.debug) {
            const activeCapacityTokenId = this.context.get('activePkp');
            console.log(
              `Machine configured to use capacity token ${activeCapacityTokenId}`
            );
          }
          break;
        case 'usePkp':
          if ('pkp' in action) {
            this.context.set(
              'activePkp',
              this.resolveContextPathOrLiteral(action.pkp)
            );
          } else if ('mint' in action) {
            const mintPkpAction = new MintPkpAction({
              debug: this.debug,
              stateMachine: this,
            });
            onEnterActions.push(mintPkpAction);
          }
          if (this.debug) {
            const activePkp = this.context.get('activePkp');
            console.log(`Machine configured to use pkp ${activePkp}`);
          }
          break;
        default:
          throw new AutomationError(
            {
              info: {
                action,
              },
            },
            `Unknown action. Check error info.`
          );
      }
    });

    // Merge all state actions
    stateParams.onEnter = async () => {
      await Promise.all(onEnterActions.map((action) => action.run()));
    };
    stateParams.onExit = async () => {
      await Promise.all(onExitActions.map((action) => action.run()));
    };

    this.addState(stateParams);
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
    const { balances, evmContractEvent, fromState, timer, toState } =
      transitionDefinition;

    const transitionConfig: TransitionParams = {
      fromState,
      toState,
    };

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
            eventData,
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
        console.log(
          `${transitionDefinition.fromState} -> ${transitionDefinition.toState} values`,
          values
        );
      return Promise.all(checks.map((check) => check(values))).then(
        (results) => {
          this.debug &&
            console.log(
              `${transitionDefinition.fromState} -> ${transitionDefinition.toState} results`,
              results
            );
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
  async stopMachine() {
    this.debug && console.log('Stopping state machine...');

    this.status = 'stopped';
    await this.exitCurrentState();
    await this.onStopCallback?.();

    this.debug && console.log('State machine stopped');
  }

  /**
   * Stops listening on the current state's transitions and exits the current state.
   */
  private async exitCurrentState() {
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
      console.warn(
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

  private handleError(error: unknown, context: string) {
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
      this.stopMachine().catch(console.error);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2);
  }
}
