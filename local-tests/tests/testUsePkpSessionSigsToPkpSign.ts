import { LIT_ENDPOINT_VERSION } from '@lit-protocol/constants';
import { log } from '@lit-protocol/misc';
import { LIT_NETWORK } from 'local-tests/setup/tinny-config';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testUsePkpSessionSigsToPkpSign
 * ✅ NETWORK=manzano yarn test:local --filter=testUsePkpSessionSigsToPkpSign
 * ✅ NETWORK=localchain yarn test:local --filter=testUsePkpSessionSigsToPkpSign
 */
export const testUsePkpSessionSigsToPkpSign = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  const pkpSessionSigs = await getPkpSessionSigs(devEnv, alice);

  const res = await devEnv.litNodeClient.pkpSign({
    toSign: alice.loveLetter,
    pubKey: alice.authMethodOwnedPkp.publicKey,
    sessionSigs: pkpSessionSigs,
  });

  // -- Expected output:
  // {
  //   r: "f67785b9c516a1fdbd224e9591554171d594bb1fb9799c851bac56212956838a",
  //   s: "799edb2732f2ebeaf90ea84cbf4c2a2e2ba509487a19d5c6b88210afe362ce42",
  //   recid: 1,
  //   signature: "0xf67785b9c516a1fdbd224e9591554171d594bb1fb9799c851bac56212956838a799edb2732f2ebeaf90ea84cbf4c2a2e2ba509487a19d5c6b88210afe362ce421c",
  //   publicKey: "0486C6E6E854337411A3884E0DEFF15D6D69663594826313BB73E18C465A079B4C2850719F45E9BE2FAC18AA78FFF2C7AEC912FA9D646B2F088C6CAAA8F7A0144A",
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
