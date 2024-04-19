import { LIT_ENDPOINT_VERSION } from '@lit-protocol/constants';
import { log } from '@lit-protocol/misc';
import { DevEnv, LIT_TESTNET } from 'local-tests/setup/tinny-setup';
import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testUseEoaSessionSigsToExecuteJsSigning
 * ✅ NETWORK=manzano yarn test:local --filter=testUseEoaSessionSigsToExecuteJsSigning
 * ✅ NETWORK=localchain yarn test:local --filter=testUseEoaSessionSigsToExecuteJsSigning
 */
export const testUseEoaSessionSigsToExecuteJsSigning = async (
  devEnv: DevEnv
) => {

  devEnv.useNewPrivateKey();
  devEnv.setExecuteJsVersion(LIT_TESTNET.LOCALCHAIN, LIT_ENDPOINT_VERSION.V1);

  const eoaSessionSigs = await getEoaSessionSigs(devEnv);

  const res = await devEnv.litNodeClient.executeJs({
    sessionSigs: eoaSessionSigs,
    code: `(async () => {
      const sigShare = await LitActions.signEcdsa({
        toSign: dataToSign,
        publicKey,
        sigName: "sig",
      });
    })();`,
    jsParams: {
      dataToSign: devEnv.toSignBytes32,
      publicKey: devEnv.hotWalletOwnedPkp.publicKey,
    },
  });

  // -- Expected output:
  // {
  //   claims: {},
  //   signatures: {
  //     sig: {
  //       r: "63311a761842b41686875862a3fb09975c838afff6ae11c5c3940da458dffe79",
  //       s: "1c25f352b4a8bf15510cecbee4e798270cdf68c45a26cf93dc32d6e03dfc720a",
  //       recid: 0,
  //       signature: "0x63311a761842b41686875862a3fb09975c838afff6ae11c5c3940da458dffe791c25f352b4a8bf15510cecbee4e798270cdf68c45a26cf93dc32d6e03dfc720a1b",
  //       publicKey: "0423F38A7663289FC58841B5F8E068FA43106BC7DDEE38D1F2542C03ABEC45B6733BE2D85A703C7B238865E45DF2175DD2A1736C56F2BAD0A965837F64BB21FB03",
  //       dataSigned: "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4",
  //     },
  //   }

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

  log('✅ testUseEoaSessionSigsToExecuteJsSigning');
};
