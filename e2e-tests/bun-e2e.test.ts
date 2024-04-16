// Test command:
// DEBUG=true bun test bun-e2e.test.ts --timeout 20000

import { expect, test } from 'bun:test';
import { DevEnv, TESTABLE_NETWORK_TYPE, devEnv } from './setup/env-setup';

// Test command
// DEBUG=true bun test bun-e2e.test.ts --timeout 20000
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
