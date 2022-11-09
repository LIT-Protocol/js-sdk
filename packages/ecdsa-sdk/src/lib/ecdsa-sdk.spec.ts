import { ecdsaSdk } from './ecdsa-sdk';

describe('ecdsaSdk', () => {
  it('should work', () => {
    expect(ecdsaSdk()).toEqual('ecdsa-sdk');
  });
});
