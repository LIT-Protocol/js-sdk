import { LIT_ENDPOINT_VERSION } from '@lit-protocol/constants';
import { log } from '@lit-protocol/misc';
import { LIT_NETWORK } from 'local-tests/setup/tinny-config';
import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testUseEoaSessionSigsToPkpSign
 * ✅ NETWORK=manzano yarn test:local --filter=testUseEoaSessionSigsToPkpSign
 * ✅ NETWORK=localchain yarn test:local --filter=testUseEoaSessionSigsToPkpSign
 */
export const testUseEoaSessionSigsToPkpSign = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);

  const runWithSessionSigs = await devEnv.litNodeClient.pkpSign({
    toSign: alice.loveLetter,
    pubKey: alice.pkp.publicKey,
    sessionSigs: eoaSessionSigs,
  });

  // Expected output:
  // {
  //   r: "25fc0d2fecde8ed801e9fee5ad26f2cf61d82e6f45c8ad1ad1e4798d3b747fd9",
  //   s: "549fe745b4a09536e6e7108d814cf7e44b93f1d73c41931b8d57d1b101833214",
  //   recid: 1,
  //   signature: "0x25fc0d2fecde8ed801e9fee5ad26f2cf61d82e6f45c8ad1ad1e4798d3b747fd9549fe745b4a09536e6e7108d814cf7e44b93f1d73c41931b8d57d1b1018332141c",
  //   publicKey: "04A3CD53CCF63597D3FFCD1DF1E8236F642C7DF8196F532C8104625635DC55A1EE59ABD2959077432FF635DF2CED36CC153050902B71291C4D4867E7DAAF964049",
  //   dataSigned: "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4",
  // }

  // -- assertions
  // r, s, dataSigned, and public key should be present
  if (!runWithSessionSigs.r) {
    throw new Error(`Expected "r" in runWithSessionSigs`);
  }
  if (!runWithSessionSigs.s) {
    throw new Error(`Expected "s" in runWithSessionSigs`);
  }
  if (!runWithSessionSigs.dataSigned) {
    throw new Error(`Expected "dataSigned" in runWithSessionSigs`);
  }
  if (!runWithSessionSigs.publicKey) {
    throw new Error(`Expected "publicKey" in runWithSessionSigs`);
  }

  // signature must start with 0x
  if (!runWithSessionSigs.signature.startsWith('0x')) {
    throw new Error(`Expected "signature" to start with 0x`);
  }

  // recid must be parseable as a number
  if (isNaN(runWithSessionSigs.recid)) {
    throw new Error(`Expected "recid" to be parseable as a number`);
  }

  log('✅ testUseEoaSessionSigsToPkpSign');
};
