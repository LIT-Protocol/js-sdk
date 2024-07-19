import { expect, jest, test } from '@jest/globals';
import { TinnyEnvironment } from '../../setup/tinny-environment';
import { LIT_TESTNET } from 'packages/e2e-tests/setup/tinny-config';

try {
  jest.setTimeout(60000);
} catch (e) {
  // ... continue execution
}

const NETWORKS: string[] = ['manzano', 'datil-dev', 'cayenne'];

describe('connections', () => {
  test.each(NETWORKS)('Testing network: %s', async (network) => {
    const devEnv = new TinnyEnvironment(network as LIT_TESTNET);
    await devEnv.init();
    expect(devEnv.litNodeClient).toBeDefined();
    expect(devEnv.litNodeClient?.ready).toBe(true);
    expect(devEnv.litNodeClient?.config.litNetwork).toBe(network);
    expect(devEnv.litNodeClient?.networkPubKey).toBeDefined();
    expect(devEnv.litNodeClient?.hdRootPubkeys).toBeDefined();
    expect(devEnv.litNodeClient?.connectedNodes?.size).toBeGreaterThanOrEqual(
      devEnv.litNodeClient?.config?.minNodeCount!
    );
  });

  afterEach(() => {
    // TODO: can be removed once v7 is merged with wasm refactors
    delete globalThis.wasmExports;
    //@ts-ignore defined in global
    delete globalThis.wasmSevSnpUtils;

    delete globalThis.wasmECDSA;
  });
});
