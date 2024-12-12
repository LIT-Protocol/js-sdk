import { Listener } from '../listeners';

export type CheckFn = (values: (unknown | undefined)[]) => Promise<boolean>;
export type resultFn = (values: (unknown | undefined)[]) => Promise<void>;
type Values = (unknown | undefined)[];

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
  private readonly values: Values;
  private readonly check?: CheckFn;
  private readonly onMatch: resultFn;
  private readonly onMismatch?: resultFn;
  private readonly queue: Values[] = [];
  private isProcessingQueue = false;

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

        // Enqueue the updated values
        this.queue.push([...this.values]);

        // Process the queue
        await this.processQueue();
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
    this.queue.length = 0; // Flush the queue as there might be more value arrays to check
    await Promise.all(this.listeners.map((listener) => listener.stop()));
  }

  private async processQueue() {
    // Prevent concurrent queue processing
    if (this.isProcessingQueue) {
      return;
    }
    this.isProcessingQueue = true;

    while (this.queue.length > 0) {
      const currentValues = this.queue.shift();

      if (!currentValues) {
        continue;
      }

      const isMatch = this.check ? await this.check(currentValues) : true;

      if (isMatch) {
        this.debug && console.log('match', currentValues);
        await this.onMatch?.(currentValues);
      } else {
        this.debug && console.log('mismatch', currentValues);
        await this.onMismatch?.(currentValues);
      }
    }

    this.isProcessingQueue = false; // Allow new queue processing
  }
}
