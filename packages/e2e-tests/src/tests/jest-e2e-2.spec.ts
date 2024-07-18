import { expect, jest, test } from '@jest/globals';
import { TinnyEnvironment } from '../../setup/tinny-environment';
import { LIT_TESTNET } from 'packages/e2e-tests/setup/tinny-config';

try {
  jest.setTimeout(60000);
} catch (e) {
  // ... continue execution
}


describe('connections', () => {
  test.each(['manzano', 'datil-dev', 'cayenne'])(
    'Testing network: %s',
    async (network) => {
      const devEnv = new TinnyEnvironment(network as LIT_TESTNET);
      await devEnv.init();
      expect(devEnv.litNodeClient).toBeDefined();
      expect(devEnv.litNodeClient?.ready).toBe(true);
      expect(devEnv.litNodeClient?.config.litNetwork).toBe(network);
    }
  );
});
