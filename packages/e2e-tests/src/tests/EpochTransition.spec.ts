import { expect, jest } from '@jest/globals';

import { TinnyEnvironment } from '@lit-protocol/tinny';

try {
  jest.setTimeout(60_000 * 1_000);
} catch (e) {
  // ... continue execution
}

describe('Epoch Transition', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  let devEnv: TinnyEnvironment;
  beforeAll(() => {
    //@ts-expect-error defined in global
    devEnv = global.devEnv;
  });

  afterAll(async () => {
    await devEnv.litNodeClient?.disconnect();
  });

  it('Should transition epoch triggering contract event', async () => {
    await devEnv.testnet?.transitionEpochAndWait();

    await new Promise((res) => {
      setTimeout(res, 1_000);
    });
    expect(
      devEnv.litNodeClient?.['_handleStakingContractStateChange']
    ).toBeCalled();
  });
});
