import { expect, jest, test } from '@jest/globals';

import { DevEnv, TESTABLE_NETWORK_TYPE, devEnv } from '../setup/env-setup';

try {
  jest.setTimeout(60000);
} catch (e) {
  // ... continue execution
}

describe('connections', () => {
  test.each(['habanero', 'manzano', 'cayenne'])(
    'Testing network: %s',
    async (network) => {
      const litDev: DevEnv = await devEnv({
        network: network as TESTABLE_NETWORK_TYPE,
      });
      expect(litDev.litNodeClient.ready).toBe(true);
      expect(litDev.litNodeClient.config.litNetwork).toBe(network);
    }
  );
});
