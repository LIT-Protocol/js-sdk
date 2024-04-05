import { greet, init } from '..';

describe('wasm', () => {
  beforeEach(async () => {
    await init();
  });

  it('should greet us nicely', () => {
    expect(greet()).toEqual('Hello, wasm!');
  });
});
