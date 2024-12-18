import { TimerListener } from './timer';

describe('TimerListener', () => {
  let timerListener: TimerListener;
  const interval = 1000;
  const offset = 0;
  const step = 1;

  beforeEach(() => {
    jest.useFakeTimers();
    timerListener = new TimerListener(interval, offset, step);
  });

  afterEach(async () => {
    await timerListener.stop();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should emit incremented values at specified intervals', async () => {
    const callback = jest.fn();
    timerListener.onStateChange(callback);

    await timerListener.start();

    jest.advanceTimersByTime(interval);
    await Promise.resolve();

    expect(callback).toHaveBeenCalledWith(1);

    jest.advanceTimersByTime(interval);
    await Promise.resolve();

    expect(callback).toHaveBeenCalledWith(2);
  });

  it('should reset count to offset when stopped', async () => {
    const callback = jest.fn();
    timerListener.onStateChange(callback);

    await timerListener.start();

    jest.advanceTimersByTime(interval * 3);
    await Promise.resolve();

    expect(callback).toHaveBeenCalledWith(3);

    await timerListener.stop();

    jest.advanceTimersByTime(interval);
    await Promise.resolve();

    expect(callback).toHaveBeenCalledTimes(3); // No additional calls after stop
  });
});
