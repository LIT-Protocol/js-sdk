import { greet, init } from './ng';

describe('ng', () => {
  beforeEach(async () => {
    await init();
  });

  it('should greet us nicely', async () => {
    expect(greet()).toEqual('Hello, wasm!');
  });
});
