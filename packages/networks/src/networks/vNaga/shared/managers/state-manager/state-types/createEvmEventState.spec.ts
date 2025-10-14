import { createEvmEventState, EvmEventEmitter } from './createEvmEventState';

describe('createEvmEventState', () => {
  let mockContract: EvmEventEmitter;
  let onSpy: jest.Mock<void, [string, (...args: any[]) => void]>;
  let offSpy: jest.Mock<void, [string, (...args: any[]) => void]>;
  let eventListeners: Map<string, (...args: any[]) => void>;

  const eventName = 'StateChanged';
  const initialValue = 'initial';

  beforeEach(() => {
    eventListeners = new Map();
    onSpy = jest.fn((event, listener) => {
      eventListeners.set(event, listener);
    });
    offSpy = jest.fn((event, listener) => {
      if (eventListeners.get(event) === listener) {
        eventListeners.delete(event);
      }
    });

    mockContract = {
      on: onSpy as any,
      off: offSpy as any,
      address: '0x123',
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial value before listen or event', () => {
    const transform = jest.fn((args) => args[0]);
    const state = createEvmEventState({
      contract: mockContract,
      eventName,
      initialValue,
      transform,
    });
    expect(state.get()).toBe(initialValue);
    expect(transform).not.toHaveBeenCalled();
  });

  it('listen should register the event listener on the contract', () => {
    const state = createEvmEventState({
      contract: mockContract,
      eventName,
      initialValue,
      transform: jest.fn(),
    });
    state.listen();
    expect(onSpy).toHaveBeenCalledWith(eventName, expect.any(Function));
    expect(onSpy).toHaveBeenCalledTimes(1);
  });

  it('listen should only register the listener once if called multiple times', () => {
    const state = createEvmEventState({
      contract: mockContract,
      eventName,
      initialValue,
      transform: jest.fn(),
    });
    state.listen();
    state.listen();
    expect(onSpy).toHaveBeenCalledTimes(1);
  });

  it('stop should unregister the event listener', () => {
    const state = createEvmEventState({
      contract: mockContract,
      eventName,
      initialValue,
      transform: jest.fn(),
    });
    state.listen();
    const listener = eventListeners.get(eventName);
    state.stop();
    expect(offSpy).toHaveBeenCalledWith(eventName, listener);
    expect(offSpy).toHaveBeenCalledTimes(1);
    expect(eventListeners.has(eventName)).toBe(false);
  });

  it('stop should do nothing if not listening', () => {
    const state = createEvmEventState({
      contract: mockContract,
      eventName,
      initialValue,
      transform: jest.fn(),
    });
    state.stop();
    expect(offSpy).not.toHaveBeenCalled();
  });

  it('stop should do nothing if called multiple times after stopping', () => {
    const state = createEvmEventState({
      contract: mockContract,
      eventName,
      initialValue,
      transform: jest.fn(),
    });
    state.listen();
    state.stop();
    state.stop();
    expect(offSpy).toHaveBeenCalledTimes(1);
  });

  it('should update value and call onChange when event is emitted', async () => {
    const newValue = 'updated';
    const transform = jest.fn((args) => args[0]);
    const onChange = jest.fn();
    const state = createEvmEventState({
      contract: mockContract,
      eventName,
      initialValue,
      transform,
      onChange,
    });

    state.listen();
    const listener = eventListeners.get(eventName);
    expect(listener).toBeDefined();

    await listener!(newValue, 'otherArg');

    expect(transform).toHaveBeenCalledWith([newValue, 'otherArg']);
    expect(state.get()).toBe(newValue);
    expect(onChange).toHaveBeenCalledWith(newValue);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('should handle async transform function', async () => {
    const transformedValue = 'asyncUpdated';
    const transform = jest.fn(async (args) => {
      await new Promise((r) => setTimeout(r, 10));
      return args[0] + transformedValue;
    });
    const onChange = jest.fn();
    const state = createEvmEventState({
      contract: mockContract,
      eventName,
      initialValue,
      transform,
      onChange,
    });

    state.listen();
    const listener = eventListeners.get(eventName);
    await listener!('eventData');

    expect(transform).toHaveBeenCalledWith(['eventData']);
    expect(state.get()).toBe('eventData' + transformedValue);
    expect(onChange).toHaveBeenCalledWith('eventData' + transformedValue);
  });

  it('should not call onChange if not provided', async () => {
    const newValue = 'updatedNoOnChange';
    const transform = jest.fn((args) => args[0]);
    const state = createEvmEventState({
      contract: mockContract,
      eventName,
      initialValue,
      transform,
    });

    state.listen();
    const listener = eventListeners.get(eventName);
    await listener!(newValue);

    expect(state.get()).toBe(newValue);
  });

  it('set should update the value directly without calling onChange', () => {
    const directSetValue = 'directSet';
    const transform = jest.fn();
    const onChange = jest.fn();
    const state = createEvmEventState({
      contract: mockContract,
      eventName,
      initialValue,
      transform,
      onChange,
    });

    state.set(directSetValue);
    expect(state.get()).toBe(directSetValue);
    expect(transform).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should propagate error from transform and not update value', async () => {
    const error = new Error('Transform failed');
    const transform = jest.fn().mockRejectedValue(error);
    const onChange = jest.fn();
    const state = createEvmEventState({
      contract: mockContract,
      eventName,
      initialValue,
      transform,
      onChange,
    });

    state.listen();
    const listener = eventListeners.get(eventName);

    await expect(listener!('someData')).rejects.toThrow(error);
    expect(state.get()).toBe(initialValue); // Value should not change
    expect(onChange).not.toHaveBeenCalled();
  });

  it('events should not be processed after stop() is called', async () => {
    const transform = jest.fn((args) => args[0]);
    const onChange = jest.fn();
    const state = createEvmEventState({
      contract: mockContract,
      eventName,
      initialValue,
      transform,
      onChange,
    });

    state.listen();
    const listener = eventListeners.get(eventName);
    state.stop();

    // Simulate event emission after stopping
    // This won't actually call the listener because it should be detached by mockContract.off
    // but if it were, we test that transform/onChange aren't called.
    // More robustly, we check that offSpy was called correctly earlier.
    if (listener && eventListeners.has(eventName)) {
      // Check if listener is somehow still there (shouldn't be)
      await listener('eventAfterStop');
    }

    expect(transform).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
    expect(state.get()).toBe(initialValue);
  });
});
