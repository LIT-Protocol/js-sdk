import { LIT_ENDPOINT_VERSION } from '@lit-protocol/constants';
import { LIT_TESTNET } from 'local-tests/setup/tinny';
import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testUseEoaSessionSigsToExecuteJsConsoleLog
 * ✅ NETWORK=manzano yarn test:local --filter=testUseEoaSessionSigsToExecuteJsConsoleLog
 * ✅ NETWORK=localchain yarn test:local --filter=testUseEoaSessionSigsToExecuteJsConsoleLog
 */
export const testUseEoaSessionSigsToExecuteJsConsoleLog = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();
  devEnv.setExecuteJsVersion(LIT_TESTNET.LOCALCHAIN, LIT_ENDPOINT_VERSION.V1);

  const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);

  const res = await devEnv.litNodeClient.executeJs({
    sessionSigs: eoaSessionSigs,
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
