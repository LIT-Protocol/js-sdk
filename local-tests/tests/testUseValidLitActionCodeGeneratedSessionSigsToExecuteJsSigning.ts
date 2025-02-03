import { LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';
import { log } from '@lit-protocol/misc';
import { LIT_ABILITY } from '@lit-protocol/constants';
import { getLitActionAuthContext } from 'local-tests/setup/session-sigs/get-lit-action-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsSigning
 * ✅ NETWORK=custom yarn test:local --filter=testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsSigning
 */
export const testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsSigning =
  async (devEnv: TinnyEnvironment) => {
    //
    const alice = await devEnv.createRandomPerson();

    const res = await devEnv.litNodeClient.executeJs({
      authContext: getLitActionAuthContext(devEnv, alice, [
        {
          resource: new LitPKPResource('*'),
          ability: LIT_ABILITY.PKPSigning,
        },
        {
          resource: new LitActionResource('*'),
          ability: LIT_ABILITY.LitActionExecution,
        },
      ]),
      code: `(async () => {
        const sigShare = await LitActions.signEcdsa({
          toSign: dataToSign,
          publicKey,
          sigName: "sig",
        });
      })();`,
      jsParams: {
        dataToSign: alice.loveLetter,
        publicKey: alice.authMethodOwnedPkp.publicKey,
      },
    });

    devEnv.releasePrivateKeyFromUser(alice);

    // -- Expected output:
    // {
    //   claims: {},
    //   signatures: {
    //     sig: {
    //       r: "6d5ce6f948ff763939c204fc0f1b750fa0267ed567ed59581082d0cbf283feef",
    //       s: "4957ece75c60388500c4b7aa38a5fbafb7c20427db181aff7806af54c16ee145",
    //       recid: 1,
    //       signature: "0x6d5ce6f948ff763939c204fc0f1b750fa0267ed567ed59581082d0cbf283feef4957ece75c60388500c4b7aa38a5fbafb7c20427db181aff7806af54c16ee1451c",
    //       publicKey: "04D10D941B04491FDC99B048E2252A69137333254C482511D6CCDD401C080AF4F51BF65D9AE2413FCE066E326D7F0CED9C139DD9BA2D1C6334FD8C14CA4DD7F3D0",
    //       dataSigned: "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4",
    //     },
    //   },
    //   decryptions: [],
    //   response: undefined,
    //   logs: "",
    // }

    // -- assertions
    if (!res.signatures.sig.r) {
      throw new Error(`Expected "r" in res.signatures.sig`);
    }
    if (!res.signatures.sig.s) {
      throw new Error(`Expected "s" in res.signatures.sig`);
    }

    if (!res.signatures.sig.dataSigned) {
      throw new Error(`Expected "dataSigned" in res.signatures.sig`);
    }

    if (!res.signatures.sig.publicKey) {
      throw new Error(`Expected "publicKey" in res.signatures.sig`);
    }

    log('✅ res:', res);
  };
