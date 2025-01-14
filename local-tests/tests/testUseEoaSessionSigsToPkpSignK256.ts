import { ethers } from 'ethers';

import { log } from '@lit-protocol/misc';
import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testUseEoaSessionSigsToPkpSignK256
 * ✅ NETWORK=datil-test yarn test:local --filter=testUseEoaSessionSigsToPkpSignK256
 * ✅ NETWORK=custom yarn test:local --filter=testUseEoaSessionSigsToPkpSignK256
 */
export const testUseEoaSessionSigsToPkpSignK256 = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();
  const messageToSign = [1, 2, 3, 4, 5];
  const messageHash = ethers.utils.arrayify(
    ethers.utils.keccak256(messageToSign)
  );

  const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);
  const runWithSessionSigs = await devEnv.litNodeClient.pkpSign({
    pubKey: alice.pkp.publicKey,
    sessionSigs: eoaSessionSigs,
    toSign: messageHash,
    signingScheme: 'EcdsaK256Sha256',
  });

  devEnv.releasePrivateKeyFromUser(alice);

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

  const signature = ethers.utils.joinSignature({
    r: '0x' + runWithSessionSigs.r,
    s: '0x' + runWithSessionSigs.s,
    recoveryParam: runWithSessionSigs.recid,
  });
  const recoveredPubKey = ethers.utils.recoverPublicKey(messageHash, signature);

  console.log('recoveredPubKey:', recoveredPubKey);

  const runWithSessionSigsUncompressedPublicKey = ethers.utils.computePublicKey(
    '0x' + runWithSessionSigs.publicKey
  );
  if (
    runWithSessionSigsUncompressedPublicKey !==
    `0x${alice.pkp.publicKey.toLowerCase()}`
  ) {
    throw new Error(
      `Expected recovered public key to match runWithSessionSigsUncompressedPublicKey and alice.pkp.publicKey`
    );
  }
  if (recoveredPubKey !== `0x${alice.pkp.publicKey.toLowerCase()}`) {
    throw new Error(
      `Expected recovered public key to match alice.pkp.publicKey`
    );
  }

  log('✅ testUseEoaSessionSigsToPkpSignK256');
};
