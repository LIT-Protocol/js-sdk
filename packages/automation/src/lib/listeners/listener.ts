import { EventEmitter } from 'events';

export interface ListenerParams {
  start?: () => Promise<void>;
  stop?: () => Promise<void>;
}

/**
 * A Listener class that manages event listeners for state changes.
 * @template T The type of the value being listened to. Defaults to unknown.
 */
export class Listener<T = unknown> {
  private emitter = new EventEmitter();
  private currentCallback: ((value: T) => Promise<void>) | null = null;

  /**
   * The start function called when all listeners are started.
   */
  public start: () => Promise<void>;

  /**
   * The stop function called when all listeners are stopped.
   */
  public stop: () => Promise<void>;

  /**
   * Constructor for the Listener class.
   * @param params The parameters object containing start and stop functions.
   */
  constructor({
    start = async () => {},
    stop = async () => {},
  }: ListenerParams = {}) {
    this.start = start;
    this.stop = stop;
  }

  /**
   * Removes all listeners from the emitter.
   */
  removeAllListeners() {
    this.emitter.removeAllListeners();
  }

  /**
   * Registers a callback to be called when the state changes.
   * If a callback was previously registered, it will be replaced with the new one.
   * @param callback The function to call with the new state value.
   */
  onStateChange(callback: (value: T) => Promise<void>) {
    if (this.currentCallback) {
      this.emitter.removeListener('stateChange', this.currentCallback);
    }
    this.currentCallback = callback;
    this.emitter.on('stateChange', callback);
  }

  /**
   * Emits a state change event with the given value.
   * @param value The state value to emit.
   */
  protected emit(value: T) {
    this.emitter.emit('stateChange', value);
  }
}
