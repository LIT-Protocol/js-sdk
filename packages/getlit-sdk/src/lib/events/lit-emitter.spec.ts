import { LitEmitter } from './lit-emitter';

describe('LitEmitter', () => {
  let litEmitter: LitEmitter;

  beforeEach(() => {
    litEmitter = new LitEmitter();
  });

  it('on method should listen for events and trigger callbacks', () => {
    const mockFn = jest.fn();
    litEmitter.on('testEvent', mockFn);
    litEmitter.emit('testEvent', 'testData');

    expect(mockFn).toHaveBeenCalledWith('testData');
  });
});
