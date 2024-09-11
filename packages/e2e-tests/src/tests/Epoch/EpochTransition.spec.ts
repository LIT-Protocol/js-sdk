import { expect, jest } from '@jest/globals';

import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from '@lit-protocol/auth-helpers';
import { getPkpSessionSigs, TinnyEnvironment } from '@lit-protocol/tinny';

describe('Epoch Transition', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  let devEnv: TinnyEnvironment;
  beforeAll(async () => {
    devEnv = new TinnyEnvironment();
    await devEnv.init();
  });

  afterAll(async () => {
    await devEnv.litNodeClient?.disconnect();
  });

  it(
    'Transition should trigger staking event',
    async () => {
      const connectedNodes: string[] | undefined =
        devEnv.litNodeClient?.config.bootstrapUrls;
      const currentEpoch = devEnv.litNodeClient?.currentEpochNumber;
      await devEnv.testnet?.transitionEpochAndWait();

      await new Promise((res) => {
        setTimeout(res, 45_000);
      });

      expect(devEnv.litNodeClient?.ready).toBe(true);

      expect(connectedNodes?.length).toEqual(
        devEnv.litNodeClient?.config.bootstrapUrls.length
      );

      for (const url of connectedNodes!) {
        expect(
          devEnv.litNodeClient?.config.bootstrapUrls.indexOf(url)
        ).toBeGreaterThan(-1);
      }

      expect(currentEpoch! + 1).toEqual(
        devEnv.litNodeClient?.currentEpochNumber
      );
    },
    60 * 60 * 1_000
  );

  it(
    'Validate BLS signature valid after epoch transition',
    async () => {
      const alice = await devEnv.createRandomPerson();
      await devEnv.testnet?.transitionEpochAndWait();

      const session = await getPkpSessionSigs(devEnv, alice, [
        {
          resource: new LitPKPResource('*'),
          ability: LitAbility.PKPSigning,
        },
        {
          resource: new LitActionResource('*'),
          ability: LitAbility.LitActionExecution,
        },
      ]);
      expect(session).toBeDefined();

      devEnv.releasePrivateKeyFromUser(alice);
    },
    60 * 60 * 1_000
  );

  it(
    'Validate BLS signature during epoch transition',
    async () => {
      const alice = await devEnv.createRandomPerson();
      devEnv.testnet?.transitionEpochAndWait();
      // give some time for the transition to start
      await new Promise<void>((res) => {
        setTimeout(res, 10_000);
      });
      const session = await getPkpSessionSigs(devEnv, alice, [
        {
          resource: new LitPKPResource('*'),
          ability: LitAbility.PKPSigning,
        },
        {
          resource: new LitActionResource('*'),
          ability: LitAbility.LitActionExecution,
        },
      ]);

      expect(session).toBeDefined();
    },
    60 * 60 * 1_000
  );

  it(
    'should return same epoch id in handshake when connecting during epoch transition',
    async () => {
      devEnv.testnet?.transitionEpochAndWait();
      // give some time for the transition to start
      await new Promise<void>((res) => {
        setTimeout(res, 15_000);
      });
      await devEnv.litNodeClient?.disconnect();
      await devEnv.litNodeClient?.connect();
    },
    60 * 60 * 1_000
  );
});
