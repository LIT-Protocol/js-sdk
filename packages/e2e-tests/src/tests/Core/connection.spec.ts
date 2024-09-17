import { expect, jest } from '@jest/globals';

import { TinnyEnvironment } from '@lit-protocol/tinny';

try {
  jest.setTimeout(60000);
} catch (e) {
  // ... continue execution
}

describe('Connections', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(jest.fn(() => {void 0;}));
  });

  let devEnv: TinnyEnvironment;
  beforeAll(async () => {
    devEnv = new TinnyEnvironment(undefined, {useRLI: false});
    await devEnv.init();
  });

  afterEach(async () => {
    await devEnv.litNodeClient?.disconnect();
  });

  it('Should connect to nodes and signal ready single connect', async () => {
    await devEnv.litNodeClient?.disconnect();
    await devEnv.litNodeClient?.connect();
    expect(devEnv.litNodeClient).toBeDefined();
    expect(devEnv.litNodeClient?.ready).toBe(true);
    expect(devEnv.litNodeClient?.config.litNetwork).toBe(
      devEnv.processEnvs.NETWORK
    );
    expect(devEnv.litNodeClient?.networkPubKey).toBeDefined();
    expect(devEnv.litNodeClient?.hdRootPubkeys).toBeDefined();
    expect(devEnv.litNodeClient?.connectedNodes?.size).toBeGreaterThanOrEqual(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      devEnv.litNodeClient?.config?.minNodeCount!
    );
  });

  it('Should connect to nodes and signal ready after disconnect', async () => {
    await devEnv.litNodeClient?.disconnect();

    await devEnv.litNodeClient?.connect().then(() => {
      expect(devEnv.litNodeClient).toBeDefined();
      expect(devEnv.litNodeClient?.ready).toBe(true);
      expect(devEnv.litNodeClient?.config.litNetwork).toBe(
        devEnv.processEnvs.NETWORK
      );
      expect(devEnv.litNodeClient?.networkPubKey).toBeDefined();
      expect(devEnv.litNodeClient?.hdRootPubkeys).toBeDefined();
      expect(devEnv.litNodeClient?.connectedNodes?.size).toBeGreaterThanOrEqual(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
        devEnv.litNodeClient?.config?.minNodeCount!
      );
    });
  });

});
