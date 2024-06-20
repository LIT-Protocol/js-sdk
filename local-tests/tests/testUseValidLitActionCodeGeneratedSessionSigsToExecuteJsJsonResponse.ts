import { LIT_ENDPOINT_VERSION } from '@lit-protocol/constants';
import { LIT_TESTNET } from 'local-tests/setup/tinny-config';
import { getLitActionSessionSigs } from 'local-tests/setup/session-sigs/get-lit-action-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsJsonResponse
 * ❌ Not supported on manzano
 * ✅ NETWORK=localchain yarn test:local --filter=testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsJsonResponse
 * ✅ NETWORK=datil-dev yarn test:local --filter=testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsJsonResponse
 */
export const testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsJsonResponse =
  async (devEnv: TinnyEnvironment) => {
    devEnv.setUnavailable(LIT_TESTNET.MANZANO);

    const alice = await devEnv.createRandomPerson();
    const litActionSessionSigs = await getLitActionSessionSigs(devEnv, alice);

    const res = await devEnv.litNodeClient.executeJs({
      sessionSigs: litActionSessionSigs,
      code: `(async () => {
      console.log('hello world')

      LitActions.setResponse({
        response: JSON.stringify({hello: 'world'})
      });

    })();`,
    });

    // Expected output:
    // {
    //   success: true,
    //   signedData: {},
    //   decryptedData: {},
    //   claimData: {},
    //   response: "{\"hello\":\"world\"}",
    //   logs: "hello world\n",
    // }

    // -- assertions
    if (!res.response) {
      throw new Error(`Expected "response" in res`);
    }

    if (!res.response.startsWith('{')) {
      throw new Error(`Expected "response" to start with {`);
    }

    if (!res.response.endsWith('}')) {
      throw new Error(`Expected "response" to end with }`);
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

    if (res.success !== true) {
      throw new Error(`Expected "success" to be true`);
    }
  };
