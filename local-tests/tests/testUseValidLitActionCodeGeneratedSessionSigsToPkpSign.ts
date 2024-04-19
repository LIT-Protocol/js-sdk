import { LitPKPResource } from '@lit-protocol/auth-helpers';
import { LIT_ENDPOINT_VERSION } from '@lit-protocol/constants';
import { log } from '@lit-protocol/misc';
import { LitAbility } from '@lit-protocol/types';
import { DevEnv, LIT_TESTNET } from 'local-tests/setup/tinny-setup';
import { getLitActionSessionSigs } from 'local-tests/setup/session-sigs/get-lit-action-session-sigs';

/**
 * Test Commands:
 * ❌ NOT AVAILABLE IN CAYENNE
 * ❌ NOT AVAILABLE IN HABANERO
 * ✅ NETWORK=localchain yarn test:local --filter=testUseValidLitActionCodeGeneratedSessionSigsToPkpSign
 *
 **/
export const testUseValidLitActionCodeGeneratedSessionSigsToPkpSign = async (
  devEnv: DevEnv
) => {
  devEnv.useNewPrivateKey();
  devEnv.setUnavailable(LIT_TESTNET.CAYENNE);
  devEnv.setUnavailable(LIT_TESTNET.MANZANO);
  devEnv.setPkpSignVersion(LIT_TESTNET.LOCALCHAIN, LIT_ENDPOINT_VERSION.V1);

  const litActionSessionSigs = await getLitActionSessionSigs(devEnv);

  const res = await devEnv.litNodeClient.pkpSign({
    toSign: devEnv.toSignBytes32,
    pubKey: devEnv.hotWalletAuthMethodOwnedPkp.publicKey,
    sessionSigs: litActionSessionSigs,
  });

  // -- Expected output:
  // {
  //   r: "ab2cef959db920d56f001c3b05637ee49af4c4441f2867ea067c413594a4c87b",
  //   s: "4bf11e17b4bb618aa6ed75cbf0406e6babfd953c5b201da697077c5fbf5b542e",
  //   recid: 1,
  //   signature: "0xab2cef959db920d56f001c3b05637ee49af4c4441f2867ea067c413594a4c87b4bf11e17b4bb618aa6ed75cbf0406e6babfd953c5b201da697077c5fbf5b542e1c",
  //   publicKey: "04400AD53C2F8BA11EBC69F05D1076D5BEE4EAE668CD66BABADE2E0770F756FDEEFC2C1D20F9A698EA3FEC6E9C944FF9FAFC2DC339B8E9392AFB9CC8AE75C5E5EC",
  //   dataSigned: "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4",
  // }

  // -- assertions
  // r, s, dataSigned, and public key should be present
  if (!res.r) {
    throw new Error(`Expected "r" in res`);
  }
  if (!res.s) {
    throw new Error(`Expected "s" in res`);
  }
  if (!res.dataSigned) {
    throw new Error(`Expected "dataSigned" in res`);
  }
  if (!res.publicKey) {
    throw new Error(`Expected "publicKey" in res`);
  }

  // signature must start with 0x
  if (!res.signature.startsWith('0x')) {
    throw new Error(`Expected "signature" to start with 0x`);
  }

  // recid must be parseable as a number
  if (isNaN(res.recid)) {
    throw new Error(`Expected "recid" to be parseable as a number`);
  }

  log('✅ res:', res);
};
