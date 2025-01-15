import EC from 'elliptic';
import { createHash } from 'crypto';

import { log } from '@lit-protocol/misc';
import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testUseEoaSessionSigsToPkpSignP256
 * ✅ NETWORK=datil-test yarn test:local --filter=testUseEoaSessionSigsToPkpSignP256
 * ✅ NETWORK=custom yarn test:local --filter=testUseEoaSessionSigsToPkpSignP256
 */
export const testUseEoaSessionSigsToPkpSignP256 = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();
  const messageToSign = [1, 2, 3, 4, 5];
  const messageHash = createHash('sha256')
    .update(Buffer.from(messageToSign))
    .digest();

  const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);
  const runWithSessionSigs = await devEnv.litNodeClient.pkpSign({
    pubKey: alice.pkp.publicKey,
    sessionSigs: eoaSessionSigs,
    toSign: messageHash,
    signingScheme: 'EcdsaP256Sha256',
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

  const ec = new EC.ec('p256');

  // Public key derived from message and signature
  const recoveredPubKey = ec.recoverPubKey(
    messageHash,
    runWithSessionSigs,
    runWithSessionSigs.recid
  );
  // Public key returned from nodes
  const runWithSessionSigsUncompressedPublicKey = ec
    .keyFromPublic(runWithSessionSigs.publicKey, 'hex')
    .getPublic(false, 'hex');

  if (
    runWithSessionSigsUncompressedPublicKey !==
    recoveredPubKey.encode('hex', false)
  ) {
    throw new Error(
      `Expected recovered public key to match runWithSessionSigsUncompressedPublicKey and recoveredPubKey.encode('hex', false)`
    );
  }
  // PKP public key lives in k256, it cannot be directly compared
  // if (recoveredPubKey.encode('hex', false) !== alice.pkp.publicKey) {
  //   throw new Error(
  //     `Expected recovered public key to match alice.pkp.publicKey`
  //   );
  // }

  log('✅ testUseEoaSessionSigsToPkpSignP256');
};
