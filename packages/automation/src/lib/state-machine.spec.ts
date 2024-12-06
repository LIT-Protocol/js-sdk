import { StateMachine } from './state-machine';
import { Listener } from './listeners';

describe('StateMachine', () => {
  let stateMachine: StateMachine;
  let listener: Listener;
  let check: jest.Mock;
  let onMatch: jest.Mock;
  let callOrder: string[];

  beforeEach(() => {
    callOrder = [];
    stateMachine = new StateMachine();
    listener = new Listener({
      start: async () => {},
      stop: async () => {},
    });
    check = jest.fn(() => true);
    onMatch = jest.fn();

    stateMachine.addState({
      key: 'A',
      onEnter: async () => {
        callOrder.push('enter A');
      },
      onExit: async () => {
        callOrder.push('exit A');
      },
    });
    stateMachine.addState({
      key: 'B',
      onEnter: async () => {
        callOrder.push('enter B');
      },
      onExit: async () => {
        callOrder.push('exit B');
      },
    });
  });

  it('should generate a unique id for each state machine instance', () => {
    const anotherStateMachine = new StateMachine();
    expect(stateMachine.id).toBeDefined();
    expect(anotherStateMachine.id).toBeDefined();
    expect(stateMachine.id).not.toEqual(anotherStateMachine.id);
  });

  it('should add states and transitions correctly', () => {
    stateMachine.addTransition({
      fromState: 'A',
      toState: 'B',
      listeners: [listener],
      check,
      onMatch,
    });
    expect(() =>
      stateMachine.addTransition({
        fromState: 'A',
        toState: 'B',
        listeners: [listener],
        check,
        onMatch,
      })
    ).not.toThrow();
  });

  it('should start the machine and trigger transitions in the correct order', async () => {
    stateMachine.addTransition({
      fromState: 'A',
      toState: 'B',
      listeners: [listener],
      check,
      onMatch,
    });
    await stateMachine.startMachine('A');

    // Simulate transition action
    await stateMachine['transitionTo']('B');

    // Check the order of calls
    await expect(callOrder).toEqual(['enter A', 'exit A', 'enter B']);
  });

  it('should not allow duplicate transitions with the same from-to combination', () => {
    const newCheck = jest.fn(async () => false);
    const newOnMatch = jest.fn();
    stateMachine.addTransition({
      fromState: 'A',
      toState: 'B',
      listeners: [listener],
      check,
      onMatch,
    });
    stateMachine.addTransition({
      fromState: 'A',
      toState: 'B',
      listeners: [listener],
      check: newCheck,
      onMatch: newOnMatch,
    });

    const transitions = stateMachine['transitions'].get('A');
    const transition = transitions?.get('B');
    expect(transition).toBeDefined();
    expect(transition?.['check']).toBe(newCheck);
  });

  describe('stopMachine', () => {
    it('should do nothing if no current state', async () => {
      await stateMachine.stopMachine();
      expect(callOrder).toEqual([]);
    });

    it('should cleanup current state and transitions', async () => {
      stateMachine.addTransition({
        fromState: 'A',
        toState: 'B',
        listeners: [listener],
        check,
        onMatch,
      });

      await stateMachine.startMachine('A');
      expect(callOrder).toEqual(['enter A']);

      await stateMachine.stopMachine();

      expect(callOrder).toEqual(['enter A', 'exit A']);
    });

    it('should call onStop callback when provided', async () => {
      const onStop = jest.fn();
      stateMachine.addTransition({
        fromState: 'A',
        toState: 'B',
        listeners: [listener],
        check,
        onMatch,
      });

      await stateMachine.startMachine('A', onStop);
      expect(callOrder).toEqual(['enter A']);

      await stateMachine.stopMachine();

      expect(onStop).toHaveBeenCalled();
      expect(callOrder).toEqual(['enter A', 'exit A']);
    });

    it('should handle errors in onStop callback', async () => {
      const errorMessage = 'onStop error';
      const onStop = jest.fn().mockRejectedValue(new Error(errorMessage));

      await stateMachine.startMachine('A', onStop);
      await expect(stateMachine.stopMachine()).rejects.toThrow(errorMessage);
    });

    it('should handle errors during cleanup', async () => {
      const errorStateMachine = new StateMachine();
      const errorMessage = 'Exit error';
      errorStateMachine.addState({
        key: 'error',
        onExit: async () => {
          throw new Error(errorMessage);
        },
      });
      await errorStateMachine.startMachine('error');

      await expect(errorStateMachine.stopMachine()).rejects.toThrow(
        errorMessage
      );
    });
  });
});