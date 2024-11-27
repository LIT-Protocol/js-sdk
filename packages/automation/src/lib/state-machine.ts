import { State, StateParams } from './states';
import { Transition, BaseTransitionParams } from './transitions';

export interface BaseStateMachineParams {
  debug?: boolean;
}

export interface TransitionParams
  extends Omit<BaseTransitionParams, 'onMatch'>,
    Partial<Pick<BaseTransitionParams, 'onMatch'>> {
  fromState: string;
  toState: string;
}

type MachineStatus = 'running' | 'stopped';

/**
 * A StateMachine class that manages states and transitions between them.
 */
export class StateMachine {
  private status: MachineStatus = 'stopped';
  private states = new Map<string, State>();
  private transitions = new Map<string, Map<string, Transition>>();
  private currentState?: State;
  private onStopCallback?: () => Promise<void>;
  private debug = false;

  constructor(params: BaseStateMachineParams = {}) {
    this.debug = params.debug ?? false;
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
}
