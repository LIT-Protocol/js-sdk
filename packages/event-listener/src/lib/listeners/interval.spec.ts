import { IntervalListener } from './interval';

describe('IntervalListener', () => {
  let intervalListener: IntervalListener<number>;
  let callback: jest.Mock;
  const interval = 1000;

  beforeEach(() => {
    jest.useFakeTimers();
    callback = jest.fn().mockResolvedValue(42);
    intervalListener = new IntervalListener(callback, interval);
  });

  afterEach(async () => {
    await intervalListener.stop();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should call the callback at specified intervals', async () => {
    let firstStateCallbackResolve: () => void;
    const firstStateCallbackPromise = new Promise<void>(
      (resolve) => (firstStateCallbackResolve = resolve)
    );
    const firstStateCallbackMock = jest.fn(async () =>
      firstStateCallbackResolve()
    );
    intervalListener.onStateChange(firstStateCallbackMock);

    await intervalListener.start();

    jest.advanceTimersByTime(interval);
    await firstStateCallbackPromise;

    expect(callback).toHaveBeenCalledTimes(1);
    expect(firstStateCallbackMock).toHaveBeenCalledWith(42);

    let secondStateCallbackResolve: () => void;
    const secondStateCallbackPromise = new Promise<void>(
      (resolve) => (secondStateCallbackResolve = resolve)
    );
    const secondStateCallbackMock = jest.fn(async () =>
      secondStateCallbackResolve()
    );
    intervalListener.onStateChange(secondStateCallbackMock);

    jest.advanceTimersByTime(interval);
    await secondStateCallbackPromise;

    expect(callback).toHaveBeenCalledTimes(2);
    expect(secondStateCallbackMock).toHaveBeenCalledWith(42);
  });

  it('should stop calling the callback when stopped', async () => {
    await intervalListener.start();
    await intervalListener.stop();

    jest.advanceTimersByTime(interval * 2);
    await Promise.resolve();

    expect(callback).toHaveBeenCalledTimes(0);
  });
});
