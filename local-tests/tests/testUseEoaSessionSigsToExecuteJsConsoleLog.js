import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testUseEoaSessionSigsToExecuteJsConsoleLog
 * ✅ NETWORK=datil-test yarn test:local --filter=testUseEoaSessionSigsToExecuteJsConsoleLog
 * ✅ NETWORK=custom yarn test:local --filter=testUseEoaSessionSigsToExecuteJsConsoleLog
 */
export const testUseEoaSessionSigsToExecuteJsConsoleLog = async (devEnv) => {
    const alice = await devEnv.createRandomPerson();
    const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);
    const res = await devEnv.litNodeClient.executeJs({
        sessionSigs: eoaSessionSigs,
        code: `(async () => {
      console.log('hello world')
    })();`,
    });
    devEnv.releasePrivateKeyFromUser(alice);
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
//# sourceMappingURL=testUseEoaSessionSigsToExecuteJsConsoleLog.js.map