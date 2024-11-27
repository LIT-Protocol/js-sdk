import { TimerListener } from '../listeners';
import { Transition } from './transition';

function coalesce(value: number | undefined) {
  return value ?? 0;
}

describe('Transition', () => {
  let transition: Transition;
  let listener1: TimerListener;
  let listener2: TimerListener;
  let check: jest.Mock;
  let onMatch: jest.Mock;
  let onMismatch: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    check = jest.fn((values: (number | undefined)[]) => {
      const [val1, val2] = values.map(coalesce);
      return val1 >= 3 && val2 >= 2;
    });
    onMatch = jest.fn();
    onMismatch = jest.fn();
    listener1 = new TimerListener(1000);
    listener2 = new TimerListener(2000);
    transition = new Transition({
      listeners: [listener1, listener2],
      check,
      onMatch,
      onMismatch,
    });
  });

  it('should call onMatch when check is true', async () => {
    await transition.startListening();

    // After 4 seconds (listener1 counter = 4, listener2 counter = 2)
    jest.advanceTimersByTime(4000);
    await expect(check).toHaveBeenCalledTimes(6);
    await expect(onMismatch).toHaveBeenCalledTimes(5); // 4 for listener1, 2 for listener2. But last one matched
    await expect(onMatch).toHaveBeenCalledTimes(1);
    await expect(onMatch).toHaveBeenCalledWith([4, 2]); // The last one is matched
  });

  it('should call onMismatch when check is false', async () => {
    await transition.startListening();

    // After 3 seconds (listener1 counter = 3, listener2 counter = 1)
    jest.advanceTimersByTime(3000);
    await expect(check).toHaveBeenCalledTimes(4);
    await expect(onMismatch).toHaveBeenCalledTimes(4); // 3 for listener1, 1 for listener2
    await expect(onMismatch).toHaveBeenCalledWith([3, 1]); // Last of failing values
    await expect(onMatch).not.toHaveBeenCalled();
  });

  it('should stop calling callbacks after stopListening', async () => {
    await transition.startListening();

    // After 2 seconds
    jest.advanceTimersByTime(3000);
    await expect(check).toHaveBeenCalledTimes(4);
    await expect(onMismatch).toHaveBeenCalledTimes(4); // 3 for listener1, 1 for listener2
    await expect(onMismatch).toHaveBeenCalledWith([3, 1]); // Example of checking values

    await transition.stopListening();

    // After another 2 seconds
    jest.advanceTimersByTime(2000);
    await expect(check).toHaveBeenCalledTimes(4); // No additional calls
    await expect(onMismatch).toHaveBeenCalledTimes(4); // No additional calls
    await expect(onMatch).not.toHaveBeenCalled();
  });

  it('should handle missing listeners, check and onMismatch callbacks gracefully', async () => {
    const basicTransition = new Transition({
      onMatch,
    });
    await basicTransition.startListening();

    // Advance time without callbacks
    jest.advanceTimersByTime(6000);
    await expect(() => basicTransition.stopListening()).not.toThrow();
  });

  it('should automatically call onMatch if check is not provided', async () => {
    const autoMatchTransition = new Transition({
      listeners: [listener1, listener2],
      onMatch,
    });
    await autoMatchTransition.startListening();

    // After 2 seconds (listener1 counter = 2, listener2 counter = 1)
    jest.advanceTimersByTime(2000);
    await expect(onMatch).toHaveBeenCalledTimes(3); // Called for each state change
    await expect(onMatch).toHaveBeenCalledWith([2, 1]);
  });

  it('should automatically call onMatch if there are no listeners and no check function', async () => {
    const noListenerTransition = new Transition({
      onMatch,
    });
    await noListenerTransition.startListening();

    // Since there are no listeners, onMatch should be called immediately
    jest.runAllTimers();
    await expect(onMatch).toHaveBeenCalledTimes(1);
    await expect(onMatch).toHaveBeenCalledWith([]);
  });

  afterEach(async () => {
    await transition.stopListening();
    jest.useRealTimers();
  });
});
