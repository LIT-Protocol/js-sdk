import { getPkpAuthContext } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testUsePkpSessionSigsToExecuteJsJsonResponse
 * ✅ NETWORK=datil-test yarn test:local --filter=testUsePkpSessionSigsToExecuteJsJsonResponse
 * ✅ NETWORK=custom yarn test:local --filter=testUsePkpSessionSigsToExecuteJsJsonResponse
 */
export const testUsePkpSessionSigsToExecuteJsJsonResponse = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  const res = await devEnv.litNodeClient.executeJs({
    authContext: getPkpAuthContext(devEnv, alice),
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

  // @ts-expect-error Always is a string
  if (!res.response.startsWith('{')) {
    throw new Error(`Expected "response" to start with {`);
  }

  // @ts-expect-error Always is a string
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
