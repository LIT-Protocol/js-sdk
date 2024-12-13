import { ethers } from 'ethers';

import {
  AutomationError,
  UnknownError,
  LIT_RPC,
} from '@lit-protocol/constants';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { LitNodeClient } from '@lit-protocol/lit-node-client';

import {
  ContractEventData,
  EVMContractEventListener,
  IntervalListener,
  Listener,
  TimerListener,
} from './listeners';
import { signWithLitActionCode, executeLitAction } from './litActions';
import { State, StateParams } from './states';
import { CheckFn, Transition } from './transitions';
import { getEvmChain } from './utils/chain';
import { getBalanceTransitionCheck, getERC20Balance } from './utils/erc20';

import {
  BaseStateMachineParams,
  ContextOrLiteral,
  PKPInfo,
  StateDefinition,
  StateMachineDefinition,
  TransitionDefinition,
  TransitionParams,
} from './types';
import { MachineContext } from './context/machine-context';

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

  private litNodeClient: LitNodeClient;
  private litContracts: LitContracts;
  private privateKey?: string;

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

  get isRunning() {
    return this.status === 'running';
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

    const onEnterFunctions = [] as (() => Promise<void>)[];
    const onExitFunctions = [] as (() => Promise<void>)[];

    const {
      context: contextAction,
      key,
      litAction,
      transaction,
      useCapacityNFT,
      usePkp,
    } = stateDefinition;

    if (contextAction) {
      if (contextAction.log?.atEnter) {
        onEnterFunctions.push(async () => {
          console.log(
            `MachineContext at state ${key} enter: `,
            this.context.get(contextAction.log?.path)
          );
        });
      }
      if (contextAction.log?.atExit) {
        onExitFunctions.push(async () => {
          console.log(
            `MachineContext at state ${key} exit: `,
            this.context.get(contextAction.log?.path)
          );
        });
      }
    }

    if (litAction) {
      onEnterFunctions.push(async () => {
        const activePkp = this.resolveContextPathOrLiteral({
          contextPath: 'activePkp',
        }) as unknown as PKPInfo;
        if (!activePkp) {
          throw new AutomationError(
            {
              info: {
                machineId: this.id,
                activePkp,
              },
            },
            `There is no active pkp. Must configure it to run a Lit Action`
          );
        }

        const signer = new ethers.Wallet(
          this.privateKey!,
          new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
        );

        const litActionResponse = await executeLitAction({
          litNodeClient: this.litNodeClient,
          capacityTokenId: this.resolveContextPathOrLiteral({
            contextPath: 'activeCapacityTokenId',
          }) as unknown as string,
          pkpEthAddress: activePkp.ethAddress,
          pkpPublicKey: activePkp.publicKey,
          authSigner: signer,
          ipfsId: this.resolveContextPathOrLiteral(litAction.ipfsId),
          code: this.resolveContextPathOrLiteral(litAction.code),
          jsParams: litAction.jsParams,
        });

        // TODO send user this result with a webhook and log
        this.context.set('lastLitActionResponse', litActionResponse);
      });
    }

    if (transaction) {
      onEnterFunctions.push(async () => {
        const activePkp = this.resolveContextPathOrLiteral({
          contextPath: 'activePkp',
        }) as unknown as PKPInfo;
        if (!activePkp.ethAddress) {
          throw new AutomationError(
            {
              info: {
                machineId: this.id,
                activePkp,
              },
            },
            `There is no active pkp. Must configure it to run a transaction`
          );
        }

        const yellowstoneMachineSigner = new ethers.Wallet(
          this.privateKey!,
          new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
        );

        const chainId = this.resolveContextPathOrLiteral(
          transaction.evmChainId
        );
        const chain = getEvmChain(chainId);
        const chainProvider = new ethers.providers.JsonRpcProvider(
          chain.rpcUrls[0],
          chain.chainId
        );

        const contract = new ethers.Contract(
          this.resolveContextPathOrLiteral(transaction.contractAddress),
          transaction.contractABI,
          chainProvider
        );

        const txParams = (transaction.params || []).map(
          this.resolveContextPathOrLiteral.bind(this)
        );
        const txMethod = this.resolveContextPathOrLiteral(transaction.method);
        const txData = await contract.populateTransaction[txMethod](
          ...txParams
        );
        const gasLimit = await chainProvider.estimateGas({
          to: this.resolveContextPathOrLiteral(transaction.contractAddress),
          data: txData.data,
          from: activePkp.ethAddress,
        });
        const gasPrice = await chainProvider.getGasPrice();
        const nonce = await chainProvider.getTransactionCount(
          activePkp.ethAddress
        );

        const rawTx = {
          chainId: chain.chainId,
          data: txData.data,
          gasLimit: gasLimit.toHexString(),
          gasPrice: gasPrice.toHexString(),
          nonce,
          to: this.resolveContextPathOrLiteral(transaction.contractAddress),
        };
        const rawTxHash = ethers.utils.keccak256(
          ethers.utils.serializeTransaction(rawTx)
        );

        // Sign with the PKP in a LitAction
        const litActionResponse = await executeLitAction({
          litNodeClient: this.litNodeClient,
          capacityTokenId: this.resolveContextPathOrLiteral({
            contextPath: 'activeCapacityTokenId',
          }) as unknown as string,
          pkpEthAddress: activePkp.ethAddress,
          pkpPublicKey: activePkp.publicKey,
          authSigner: yellowstoneMachineSigner,
          code: signWithLitActionCode,
          jsParams: {
            toSign: ethers.utils.arrayify(rawTxHash),
            publicKey: activePkp.publicKey,
            sigName: 'signedTransaction',
          },
        });

        const signature = litActionResponse.response as string;
        const jsonSignature = JSON.parse(signature);
        jsonSignature.r = '0x' + jsonSignature.r.substring(2);
        jsonSignature.s = '0x' + jsonSignature.s;
        const hexSignature = ethers.utils.joinSignature(jsonSignature);

        const signedTx = ethers.utils.serializeTransaction(rawTx, hexSignature);

        const receipt = await chainProvider.sendTransaction(signedTx);

        // TODO send user this result with a webhook and log
        this.context.set('lastTransactionReceipt', receipt);
      });
    }

    if (usePkp) {
      if ('pkp' in usePkp) {
        this.context.set(
          'activePkp',
          this.resolveContextPathOrLiteral(usePkp.pkp)
        );
      } else if ('mint' in usePkp) {
        onEnterFunctions.push(async () => {
          const mintingReceipt =
            await this.litContracts!.pkpNftContractUtils.write.mint();
          const pkp = mintingReceipt.pkp;
          this.debug && console.log(`Minted PKP: ${pkp}`);
          this.context.set('activePkp', pkp);
        });
      }
      if (this.debug) {
        const activePkp = this.context.get('activePkp');
        console.log(`Machine configured to use pkp ${activePkp}`);
      }
    }

    if (useCapacityNFT) {
      if ('capacityTokenId' in useCapacityNFT) {
        this.context.set(
          'activeCapacityTokenId',
          this.resolveContextPathOrLiteral(useCapacityNFT.capacityTokenId)
        );
      } else if ('mint' in useCapacityNFT) {
        onEnterFunctions.push(async () => {
          const capacityCreditNFT =
            await this.litContracts.mintCapacityCreditsNFT({
              requestsPerSecond: useCapacityNFT.requestPerSecond,
              daysUntilUTCMidnightExpiration:
                useCapacityNFT.daysUntilUTCMidnightExpiration,
            });
          const capacityTokeId = capacityCreditNFT.capacityTokenIdStr;
          this.debug && console.log(`Minted PKP: ${capacityTokeId}`);
          this.context.set(`activeCapacityTokenId`, capacityTokeId);
        });
      }
      if (this.debug) {
        const activeCapacityTokenId = this.context.get('activePkp');
        console.log(
          `Machine configured to use capacity token ${activeCapacityTokenId}`
        );
      }
    }

    // Merge all state functions
    stateParams.onEnter = async () => {
      await Promise.all(onEnterFunctions.map((onEnter) => onEnter()));
    };
    stateParams.onExit = async () => {
      await Promise.all(onExitFunctions.map((onExit) => onExit()));
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
   * Stops the state machine by exiting the current state and not moving to another one.
   */
  async stopMachine() {
    this.debug && console.log('Stopping state machine...');

    this.status = 'stopped';
    await this.exitCurrentState();
    await this.onStopCallback?.();

    this.debug && console.log('State machine stopped');
  }

  private resolveContextPathOrLiteral<T = unknown>(
    value: ContextOrLiteral<T> | T
  ): T {
    if (value && typeof value === 'object' && 'contextPath' in value) {
      return this.context.get(value.contextPath) as T;
    }
    return value;
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
      console.warn(`State ${stateKey} is already active. Skipping transition.`);
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
