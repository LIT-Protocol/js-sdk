import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { LIT_NETWORK } from '@lit-protocol/constants';
export const testExample = async (devEnv) => {
    // Note: This test will be skipped if we are testing on the DatilDev network
    devEnv.setUnavailable(LIT_NETWORK.DatilDev);
    const alice = await devEnv.createRandomPerson();
    const aliceEoaSessionSigs = await getEoaSessionSigs(devEnv, alice);
    const aliceExecuteJsRes = await devEnv.litNodeClient.executeJs({
        sessionSigs: aliceEoaSessionSigs,
        code: `(async () => {
      const sigShare = await LitActions.signEcdsa({
        toSign: dataToSign,
        publicKey,
        sigName: "sig",
      });
    })();`,
        jsParams: {
            dataToSign: alice.loveLetter,
            publicKey: alice.pkp.publicKey,
        },
    });
    console.log('aliceExecuteJsRes:', aliceExecuteJsRes);
    devEnv.releasePrivateKeyFromUser(alice);
    // console.log('aliceEoaSessionSigs: ', aliceEoaSessionSigs);
    // const alicePkpSessionSigs = await getPkpSessionSigs(devEnv, alice);
    // console.log('alicePkpSessionSigs: ', alicePkpSessionSigs);
    // const aliceLitActionSessionSigs = await getLitActionSessionSigs(
    //   devEnv,
    //   alice
    // );
    // console.log('aliceLitActionSessionSigs: ', aliceLitActionSessionSigs);
};
//# sourceMappingURL=test-example.js.map