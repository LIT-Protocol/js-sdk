import { getPkpAuthContext } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testUsePkpSessionSigsToExecuteJsConsoleLog
 * ✅ NETWORK=datil-test yarn test:local --filter=testUsePkpSessionSigsToExecuteJsConsoleLog
 * ✅ NETWORK=custom yarn test:local --filter=testUsePkpSessionSigsToExecuteJsConsoleLog
 */
export const testUsePkpSessionSigsToExecuteJsConsoleLog = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  const res = await devEnv.litNodeClient.executeJs({
    authContext: getPkpAuthContext(devEnv, alice),
    code: `(async () => {
      console.log('hello world')
    })();`,
  });

  devEnv.releasePrivateKeyFromUser(alice);

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
