import { ng } from './ng';

describe('ng', () => {
  it('should work', async () => {
    expect(await ng()).toEqual('Hello, wasm!');
  });
});
