import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testUseEoaSessionSigsToExecuteJsJsonResponse
 * ✅ NETWORK=datil-test yarn test:local --filter=testUseEoaSessionSigsToExecuteJsJsonResponse
 * ✅ NETWORK=custom yarn test:local --filter=testUseEoaSessionSigsToExecuteJsJsonResponse
 */
export const testUseEoaSessionSigsToExecuteJsJsonResponse = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);

  const res = await devEnv.litNodeClient.executeJs({
    sessionSigs: eoaSessionSigs,
    code: `(async () => {
      console.log('hello world')

      LitActions.setResponse({
        response: JSON.stringify({hello: 'world'})
      });

    })();`,
  });

  devEnv.releasePrivateKeyFromUser(alice);

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
