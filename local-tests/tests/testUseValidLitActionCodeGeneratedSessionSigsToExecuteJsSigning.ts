import { log } from '@lit-protocol/misc';
import { DevEnv } from 'local-tests/setup/env-setup';
import { getLitActionSessionSigsForExecuteJs } from 'local-tests/setup/session-sigs/get-lit-action-session-sigs';

/**
 * Test Commands:
 * ❌ NOT AVAILABLE IN CAYENNE
 * ❌ NOT AVAILABLE IN HABANERO
 * ✅ yarn test:local --filter=testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsSigning --network=localchain --version=v1
 */
export const testUseValidLitActionCodeGeneratedSessionSigsToExecuteJsSigning =
  async (devEnv: DevEnv) => {
    const litActionSessionSigs = await getLitActionSessionSigsForExecuteJs(
      devEnv
    );

    const res = await devEnv.litNodeClient.executeJs({
      sessionSigs: litActionSessionSigs,
      code: `(async () => {
        const sigShare = await LitActions.signEcdsa({
          toSign: dataToSign,
          publicKey,
          sigName: "sig",
        });
      })();`,
      jsParams: {
        dataToSign: devEnv.toSignBytes32,
        publicKey: devEnv.hotWalletAuthMethodOwnedPkp.publicKey,
      },
    });

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
