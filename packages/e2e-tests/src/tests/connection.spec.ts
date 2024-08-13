import { expect, jest } from '@jest/globals';

import { TinnyEnvironment } from '@lit-protocol/tinny';

try {
  jest.setTimeout(60000);
} catch (e) {
  // ... continue execution
}

describe('Connections', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  let devEnv: TinnyEnvironment;
  beforeAll(async () => {
    //@ts-expect-error defined in global
    devEnv = global.devEnv;
  });

  afterAll(async () => {
    await devEnv.litNodeClient?.disconnect();
  });

  it('Testing Network Handshake', async () => {
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
