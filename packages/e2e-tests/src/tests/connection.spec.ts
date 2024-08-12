import { expect, jest, test } from '@jest/globals';
import { TinnyEnvironment, LIT_TESTNET } from '@lit-protocol/tinny';

try {
  jest.setTimeout(60000);
} catch (e) {
  // ... continue execution
}

describe('Connections', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('Testing network: Manzano', async () => {
    const devEnv = new TinnyEnvironment();
    await devEnv.init();
    expect(devEnv.litNodeClient).toBeDefined();
    expect(devEnv.litNodeClient?.ready).toBe(true);
    expect(devEnv.litNodeClient?.config.litNetwork).toBe(devEnv.processEnvs.NETWORK);
    expect(devEnv.litNodeClient?.networkPubKey).toBeDefined();
    expect(devEnv.litNodeClient?.hdRootPubkeys).toBeDefined();
    expect(devEnv.litNodeClient?.connectedNodes?.size).toBeGreaterThanOrEqual(
      devEnv.litNodeClient?.config?.minNodeCount!
    );

    await devEnv.litNodeClient?.disconnect();
  });
});
