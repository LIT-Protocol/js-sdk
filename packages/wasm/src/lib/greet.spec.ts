import { greet } from '..';

describe('wasm', () => {
  it('should greet us nicely', () => {
    expect(greet()).toEqual('Hello, wasm!');
  });
});
