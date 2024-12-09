import { LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';
import { LIT_ABILITY } from '@lit-protocol/constants';
import { getLitActionSessionSigs } from 'local-tests/setup/session-sigs/get-lit-action-session-sigs';
/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsConsoleLog
 * ✅ NETWORK=custom yarn test:local --filter=testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsConsoleLog
 */
export const testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsConsoleLog = async (devEnv) => {
    const alice = await devEnv.createRandomPerson();
    const litActionSessionSigs = await getLitActionSessionSigs(devEnv, alice, [
        {
            resource: new LitPKPResource('*'),
            ability: LIT_ABILITY.PKPSigning,
        },
        {
            resource: new LitActionResource('*'),
            ability: LIT_ABILITY.LitActionExecution,
        },
    ]);
    const res = await devEnv.litNodeClient.executeJs({
        sessionSigs: litActionSessionSigs,
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
//# sourceMappingURL=testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsConsoleLog.js.map