import { Listener } from './listener';

describe('Listener', () => {
  let listener: Listener<number>;
  let setup: jest.Mock;
  let teardown: jest.Mock;

  beforeEach(() => {
    setup = jest.fn();
    teardown = jest.fn();
    listener = new (class extends Listener<number> {
      constructor() {
        super({
          start: setup,
          stop: teardown,
        });
      }

      // Expose emit for testing
      public testEmit(value: number) {
        this.emit(value);
      }
    })();
  });

  it('should call setup on start', async () => {
    await listener.start();
    expect(setup).toHaveBeenCalled();
  });

  it('should call teardown on stop', async () => {
    await listener.stop();
    expect(teardown).toHaveBeenCalled();
  });

  it('should notify listeners of state changes with the new value', () => {
    const callback = jest.fn();
    listener.onStateChange(callback);
    (listener as any).testEmit(5);
    expect(callback).toHaveBeenCalledWith(5);
  });

  it('should not remove listeners on stop', async () => {
    const callback = jest.fn();
    listener.onStateChange(callback);
    await listener.stop();
    (listener as any).testEmit(5);
    expect(callback).toHaveBeenCalled();
  });

  it('should replace previous callback when registering a new one', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    // Register first callback
    listener.onStateChange(callback1);
    (listener as any).testEmit(5);
    expect(callback1).toHaveBeenCalledWith(5);
    expect(callback2).not.toHaveBeenCalled();

    // Register second callback - should replace the first one
    listener.onStateChange(callback2);
    (listener as any).testEmit(10);
    expect(callback1).toHaveBeenCalledTimes(1); // Should not receive the second emit
    expect(callback2).toHaveBeenCalledWith(10);
  });
});
