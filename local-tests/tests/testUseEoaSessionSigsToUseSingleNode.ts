import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testUseEoaSessionSigsToUseSingleNode
 * ✅ NETWORK=datil-test yarn test:local --filter=testUseEoaSessionSigsToUseSingleNode
 * ✅ NETWORK=datil yarn test:local --filter=testUseEoaSessionSigsToUseSingleNode
 */
export const testUseEoaSessionSigsToUseSingleNode = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  let res: any;

  try {
    const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);

    res = await devEnv.litNodeClient.executeJs({
      sessionSigs: eoaSessionSigs,
      code: `(async () => {
          console.log('hello world')
        })();`,

      // note: re-enable this when we want to require a certain number of responses
      // numResponsesRequired: 1,
      useSingleNode: true,
    });
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
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
