import { DevEnv } from 'local-tests/setup/env-setup';
import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';

/**
 * Test Commands:
 * ✅ yarn test:local --filter=testUseEoaSessionSigsToExecuteJsJsonResponse --network=cayenne --version=v0
 * ✅ yarn test:local --filter=testUseEoaSessionSigsToExecuteJsJsonResponse --network=manzano --version=v0
 * ✅ yarn test:local --filter=testUseEoaSessionSigsToExecuteJsJsonResponse --network=localchain --version=v1
 */
export const testUseEoaSessionSigsToExecuteJsJsonResponse = async (
  devEnv: DevEnv
) => {
  const eoaSessionSigs = await getEoaSessionSigs(devEnv);

  const res = await devEnv.litNodeClient.executeJs({
    sessionSigs: eoaSessionSigs,
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
