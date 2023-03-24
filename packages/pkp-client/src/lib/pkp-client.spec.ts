import { pkpClient } from './pkp-client';

describe('pkpClient', () => {
  it('should work', () => {
    expect(pkpClient()).toEqual('pkp-client');
  });
});
