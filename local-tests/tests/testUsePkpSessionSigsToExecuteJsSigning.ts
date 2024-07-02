import { LIT_ENDPOINT_VERSION } from '@lit-protocol/constants';
import { log } from '@lit-protocol/misc';
import { LIT_TESTNET } from 'local-tests/setup/tinny-config';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testUsePkpSessionSigsToExecuteJsSigning
 * ✅ NETWORK=manzano yarn test:local --filter=testUsePkpSessionSigsToExecuteJsSigning
 * ✅ NETWORK=localchain yarn test:local --filter=testUsePkpSessionSigsToExecuteJsSigning
 */
export const testUsePkpSessionSigsToExecuteJsSigning = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  const pkpSessionSigs = await getPkpSessionSigs(devEnv, alice);

  const res = await devEnv.litNodeClient.executeJs({
    sessionSigs: pkpSessionSigs,
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
  //       r: "8d2a3b3fa49e67b6bf9de15adfc0b5fbe04b6d730cbef60f4c211c4803bd9c3f",
  //       s: "1f819cc7a74a72e6f1b16a9a665f19cdd7294132d8a1c70871a752a6d70615e4",
  //       recid: 1,
  //       signature: "0x8d2a3b3fa49e67b6bf9de15adfc0b5fbe04b6d730cbef60f4c211c4803bd9c3f1f819cc7a74a72e6f1b16a9a665f19cdd7294132d8a1c70871a752a6d70615e41c",
  //       publicKey: "044395E44BA89AC0D0E76DEECD937C7BC0AE96B47766AB01CEC5449A8F869754560ACAEAC82CD48FAD3553AD47D7FAA99131F6E7E1B19DEBA058BB6D6B97F2BDB1",
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

  // -- signatures.sig.signature must start with 0x
  if (!res.signatures.sig.signature.startsWith('0x')) {
    throw new Error(`Expected "signature" to start with 0x`);
  }

  // -- signatures.sig.recid must be parseable as a number
  if (isNaN(res.signatures.sig.recid)) {
    throw new Error(`Expected "recid" to be parseable as a number`);
  }

  log('✅ res:', res);
};
