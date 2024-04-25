// Test command
// npx jest './e2e-tests/jest-e2e.test.ts' -c './e2e-tests/jest.config.ts' -t 'connections'

import { DevEnv, TESTABLE_NETWORK_TYPE, devEnv } from '../setup/env-setup';
import { expect, test } from '@jest/globals';

try {
  jest.setTimeout(60000);
} catch (e) {
  // ... continue execution
}

describe('connections', () => {
  test.each(['habanero', 'manzano', 'cayenne'])(
    'Testing network in e2e-2: %s',
    async (network) => {
      const litDev: DevEnv = await devEnv({
        network: network as TESTABLE_NETWORK_TYPE,
      });
      expect(litDev.litNodeClient.ready).toBe(true);
      expect(litDev.litNodeClient.config.litNetwork).toBe(network);
    }
  );
});
