// minimal evm-style emitter interface (ethers.Provider or Contract)
export type EvmEventEmitter = {
  on: (eventName: string, listener: (...args: any[]) => void) => void;
  off: (eventName: string, listener: (...args: any[]) => void) => void;
  address?: string;
};

export interface EventState<T> {
  get: () => T;
  listen: () => void;
  stop: () => void;
  set: (value: T) => void;
}

interface CreateEvmEventStateOptions<T> {
  contract: EvmEventEmitter;
  eventName: string;
  initialValue: T;
  /** Transform raw event args into your T (can be async) */
  transform: (args: any[]) => T | Promise<T>;
  /** Optional hook when the value changes */
  onChange?: (value: T) => void;
}

export const createEvmEventState = <T>({
  contract,
  eventName,
  initialValue,
  transform,
  onChange,
}: CreateEvmEventStateOptions<T>): EventState<T> => {
  let value: T = initialValue;
  let attached = false;

  const listener = async (...args: any[]) => {
    try {
      const newValue = await transform(args);
      value = newValue;
      onChange?.(newValue);
    } catch (err) {
      throw err;
    }
  };

  const get = () => value;

  const listen = () => {
    if (attached) return;
    console.log(`👂 Listening for ${eventName}`);
    contract.on(eventName, listener);
    attached = true;
  };

  const stop = () => {
    if (!attached) return;
    console.log(`🔇 Stopping listener for ${eventName}`);
    contract.off(eventName, listener);
    attached = false;
  };

  const set = (newValue: T) => {
    value = newValue;
  };

  return { get, listen, stop, set };
};
