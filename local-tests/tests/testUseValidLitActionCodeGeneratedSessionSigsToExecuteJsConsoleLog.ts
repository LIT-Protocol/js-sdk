import { LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';
import { LIT_ENDPOINT_VERSION } from '@lit-protocol/constants';
import { LitAbility } from '@lit-protocol/types';
import { LIT_TESTNET } from 'local-tests/setup/tinny-config';
import { getLitActionSessionSigs } from 'local-tests/setup/session-sigs/get-lit-action-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ❌ Not supported on cayenne
 * ❌ Not supported on manzano
 * ✅ NETWORK=localchain yarn test:local --filter=testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsConsoleLog
 */
export const testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsConsoleLog =
  async (devEnv: TinnyEnvironment) => {
    devEnv.setUnavailable(LIT_TESTNET.CAYENNE);
    devEnv.setUnavailable(LIT_TESTNET.MANZANO);

    const alice = await devEnv.createRandomPerson();

    const litActionSessionSigs = await getLitActionSessionSigs(devEnv, alice, [
      {
        resource: new LitPKPResource('*'),
        ability: LitAbility.PKPSigning,
      },
      {
        resource: new LitActionResource('*'),
        ability: LitAbility.LitActionExecution,
      },
    ]);

    const res = await devEnv.litNodeClient.executeJs({
      sessionSigs: litActionSessionSigs,
      code: `(async () => {
      console.log('hello world')
    })();`,
    });

    console.log('res:', res);

    // Expected output:
    // {
    //   success: true,
    //   signedData: {},
    //   decryptedData: {},
    //   claimData: {},
    //   response: "",
    //   logs: "hello world\n",
    // }

    // -- assertions
    if (res.response) {
      throw new Error(`Expected "response" to be falsy`);
    }

    if (!res.logs) {
      throw new Error(`Expected "logs" in res`);
    }

    if (!res.logs.includes('hello world')) {
      throw new Error(`Expected "logs" to include 'hello world'`);
    }

    if (!res.success) {
      throw new Error(`Expected "success" in res`);
    }
  };
