import { log } from '@lit-protocol/misc';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { api } from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { Keypair } from '@solana/web3.js';

const { generatePrivateKey, signMessageWithEncryptedKey, exportPrivateKey } =
  api;

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

  const { pkpAddress, generatedPublicKey, id } = await generatePrivateKey({
    pkpSessionSigs,
    network: 'solana',
    litNodeClient: devEnv.litNodeClient,
    memo: 'Test key',
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
    network: 'solana',
    messageToSign,
    litNodeClient: devEnv.litNodeClient,
    id,
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

  const pkpSessionSigsExport = await getPkpSessionSigs(
    devEnv,
    alice,
    null,
    new Date(Date.now() + 1000 * 60 * 10).toISOString()
  ); // 10 mins expiry

  const { decryptedPrivateKey } = await exportPrivateKey({
    pkpSessionSigs: pkpSessionSigsExport,
    litNodeClient: devEnv.litNodeClient,
    network: 'solana',
    id,
  });

  const solanaKeyPair = Keypair.fromSecretKey(
    Buffer.from(decryptedPrivateKey, 'hex')
  );
  const decryptedPublicKey = solanaKeyPair.publicKey;

  if (decryptedPublicKey.toString() !== generatedPublicKey) {
    throw new Error(
      `Decrypted decryptedPublicKey: ${decryptedPublicKey} doesn't match with the original generatedPublicKey: ${generatedPublicKey}`
    );
  }

  log('✅ testGenerateSolanaWrappedKey');
};
