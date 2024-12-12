import { Listener } from '../listeners';

export type CheckFn = (values: (unknown | undefined)[]) => Promise<boolean>;
export type resultFn = (values: (unknown | undefined)[]) => Promise<void>;

/**
 * A Transition class that manages state transitions based on listeners and conditions.
 */
export interface BaseTransitionParams {
  debug?: boolean;
  listeners?: Listener<any>[]; // should be unknown but that makes callers to cast listeners
  check?: CheckFn;
  onMatch: resultFn;
  onMismatch?: resultFn;
}

export class Transition {
  private readonly debug: boolean;
  private readonly listeners: Listener<unknown>[];
  private readonly values: (unknown | undefined)[];
  private readonly check?: CheckFn;
  private readonly onMatch: resultFn;
  private readonly onMismatch?: resultFn;

  /**
   * Creates a new Transition instance. If no listeners are provided, the transition will automatically match on the next event loop.
   *
   * @param params An object containing listeners, check function, and optional onMatch and onMismatch functions.
   */
  constructor({
    debug,
    listeners = [],
    check,
    onMatch,
    onMismatch,
  }: BaseTransitionParams) {
    this.debug = debug ?? false;
    this.listeners = listeners;
    this.check = check;
    this.onMatch = onMatch;
    this.onMismatch = onMismatch;
    this.values = new Array(listeners.length).fill(undefined);
    this.setupListeners();
  }

  /**
   * Sets up listeners for state changes and handles transition logic.
   */
  private setupListeners() {
    this.listeners.forEach((listener, index) => {
      listener.onStateChange(async (value: unknown) => {
        this.values[index] = value;
        const isMatch = this.check ? await this.check(this.values) : true;
        if (isMatch) {
          this.debug && console.log('match', this.values);
          await this.onMatch?.(this.values);
        } else {
          this.debug && console.log('mismatch', this.values);
          await this.onMismatch?.(this.values);
        }
      });
    });
  }

  /**
   * Starts all listeners for this transition.
   */
  async startListening() {
    this.debug && console.log('startListening');
    await Promise.all(this.listeners.map((listener) => listener.start()));

    if (!this.listeners.length) {
      // If the transition does not have any listeners it will never emit. Therefore, we "match" automatically on next event loop
      setTimeout(() => {
        this.debug && console.log('Transition without listeners: auto match');
        this.onMatch([]);
      }, 0);
    }
  }

  /**
   * Stops all listeners for this transition.
   */
  async stopListening() {
    this.debug && console.log('stopListening');
    await Promise.all(this.listeners.map((listener) => listener.stop()));
  }
}
