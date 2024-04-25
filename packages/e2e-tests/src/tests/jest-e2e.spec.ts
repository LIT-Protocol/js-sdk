// Test command
// npx jest './e2e-tests/jest-e2e.test.ts' -c './e2e-tests/jest.config.ts' -t 'connections'

import { DevEnv, TESTABLE_NETWORK_TYPE, devEnv } from '../setup/env-setup';

try {
  jest.setTimeout(60000);
} catch (e) {
  // ... continue execution
}

describe('connections', () => {
  test('test multiple networks', async () => {
    for (let network of ['habanero', 'manzano', 'cayenne']) {
      console.log(`Testing network: ${network}`);
      const litDev: DevEnv = await devEnv({
        network: network as TESTABLE_NETWORK_TYPE,
      });
      expect(litDev.litNodeClient.ready).toBe(true);
      expect(litDev.litNodeClient.config.litNetwork).toBe(network);
    }
  });
});
