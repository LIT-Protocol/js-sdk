import { Listener } from '../listeners';

/**
 * A Transition class that manages state transitions based on listeners and conditions.
 */
export interface BaseTransitionParams {
  listeners?: Listener<any>[];
  check?: (values: (any | undefined)[]) => Promise<boolean>;
  onMatch: (values: (any | undefined)[]) => Promise<void>;
  onMismatch?: (values: (any | undefined)[]) => Promise<void>;
}

export class Transition {
  private debug = false;
  private listeners: Listener<any>[];
  private readonly values: (any | undefined)[];
  private readonly check?: (values: (any | undefined)[]) => Promise<boolean>;
  private readonly onMatch: (values: (any | undefined)[]) => Promise<void>;
  private readonly onMismatch?: (values: (any | undefined)[]) => Promise<void>;

  /**
   * Creates a new Transition instance. If no listeners are provided, the transition will automatically match on the next event loop.
   *
   * @param params An object containing listeners, check function, and optional onMatch and onMismatch functions.
   */
  constructor({
    listeners = [],
    check,
    onMatch,
    onMismatch,
  }: BaseTransitionParams) {
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
      listener.onStateChange(async (value: any) => {
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
      // If the transition does not have any listeners it will never emit. Therefore, we "emit" automatically on next event loop
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
