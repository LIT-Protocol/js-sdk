import { State } from './state';

describe('State', () => {
  it('should create state with name', () => {
    const state = new State({ key: 'TestState' });
    expect(state.key).toBe('TestState');
  });

  it('should execute onEnter callback when entering state', async () => {
    const onEnter = jest.fn();
    const state = new State({ key: 'TestState', onEnter });

    await state.enter();

    expect(onEnter).toHaveBeenCalled();
  });

  it('should execute onExit callback when exiting state', async () => {
    const onExit = jest.fn();
    const state = new State({ key: 'TestState', onExit });

    await state.exit();

    expect(onExit).toHaveBeenCalled();
  });

  it('should not throw when entering state without onEnter callback', async () => {
    const state = new State({ key: 'TestState' });
    await expect(() => state.enter()).not.toThrow();
  });

  it('should not throw when exiting state without onExit callback', async () => {
    const state = new State({ key: 'TestState' });
    await expect(() => state.exit()).not.toThrow();
  });

  it('should handle throwing onEnter callback', async () => {
    const onEnter = jest.fn().mockImplementation(() => {
      throw new Error('Enter error');
    });
    const state = new State({ key: 'TestState', onEnter });

    await expect(() => state.enter()).rejects.toThrow('Enter error');
  });

  it('should handle throwing onExit callback', async () => {
    const onExit = jest.fn().mockImplementation(() => {
      throw new Error('Exit error');
    });
    const state = new State({ key: 'TestState', onExit });

    await expect(() => state.exit()).rejects.toThrow('Exit error');
  });
});
