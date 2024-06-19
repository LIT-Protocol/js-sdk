import { log } from '@lit-protocol/misc';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import {
  generatePrivateKey,
  signMessageWithEncryptedKey,
} from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { NETWORK_SOLANA } from 'packages/wrapped-keys/src/lib/constants';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testGenerateSolanaWrappedKey
 * ✅ NETWORK=manzano yarn test:local --filter=testGenerateSolanaWrappedKey
 * ✅ NETWORK=localchain yarn test:local --filter=testGenerateSolanaWrappedKey
 */
export const testGenerateSolanaWrappedKey = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  const pkpSessionSigs = await getPkpSessionSigs(
    devEnv,
    alice,
    null,
    new Date(Date.now() + 1000 * 60 * 10).toISOString()
  ); // 10 mins expiry

  console.log(pkpSessionSigs);

  const { pkpAddress, generatedPublicKey } = await generatePrivateKey({
    pkpSessionSigs,
    network: NETWORK_SOLANA,
    litNodeClient: devEnv.litNodeClient,
  });

  console.log(`generatedPublicKey: ${generatedPublicKey}`);

  const alicePkpAddress = alice.authMethodOwnedPkp.ethAddress;
  if (pkpAddress !== alicePkpAddress) {
    throw new Error(
      `Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`
    );
  }

  const pkpSessionSigsSigning = await getPkpSessionSigs(
    devEnv,
    alice,
    null,
    new Date(Date.now() + 1000 * 60 * 10).toISOString()
  ); // 10 mins expiry

  console.log(pkpSessionSigsSigning);

  const messageToSign = 'This is a test message';

  const signature = await signMessageWithEncryptedKey({
    pkpSessionSigs: pkpSessionSigsSigning,
    network: NETWORK_SOLANA,
    messageToSign,
    litNodeClient: devEnv.litNodeClient,
  });

  console.log('signature');
  console.log(signature);

  const signatureIsValidForPublicKey = nacl.sign.detached.verify(
    Buffer.from(messageToSign),
    bs58.decode(signature),
    bs58.decode(generatedPublicKey)
  );

  if (!signatureIsValidForPublicKey)
    throw new Error(
      `signature: ${signature} doesn't validate for the Solana public key: ${generatedPublicKey}`
    );

  // FIX: Export broken as we can't decrypt data encrypted inside a Lit Action
  // const decryptedPrivateKey = await exportPrivateKey({
  //   pkpSessionSigs: pkpSessionSigsExport,
  //   litNodeClient: devEnv.litNodeClient,
  // });

  // const wallet = new ethers.Wallet(decryptedPrivateKey);
  // const decryptedPublicKey = wallet.publicKey;

  // if (decryptedPublicKey !== generatedPublicKey) {
  //   throw new Error(
  //     `Decrypted decryptedPublicKey: ${decryptedPublicKey} doesn't match with the original generatedPublicKey: ${generatedPublicKey}`
  //   );
  // }

  log('✅ testGenerateSolanaWrappedKey');
};
