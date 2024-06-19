import { log } from '@lit-protocol/misc';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import {
  SolanaLitTransaction,
  importPrivateKey,
  signTransactionWithEncryptedKey,
} from '@lit-protocol/wrapped-keys';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
} from '@solana/web3.js';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { NETWORK_SOLANA } from 'packages/wrapped-keys/src/lib/constants';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testSignTransactionWithSolanaEncryptedKey
 * ✅ NETWORK=manzano yarn test:local --filter=testSignTransactionWithSolanaEncryptedKey
 * ✅ NETWORK=localchain yarn test:local --filter=testSignTransactionWithSolanaEncryptedKey
 */
export const testSignTransactionWithSolanaEncryptedKey = async (
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

  const solanaKeypair = Keypair.generate();
  const privateKey = Buffer.from(solanaKeypair.secretKey).toString('hex');

  const pkpAddress = await importPrivateKey({
    pkpSessionSigs,
    privateKey,
    litNodeClient: devEnv.litNodeClient,
  });

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

  const solanaTransaction = new Transaction();
  solanaTransaction.add(
    SystemProgram.transfer({
      fromPubkey: solanaKeypair.publicKey,
      toPubkey: new PublicKey(solanaKeypair.publicKey),
      lamports: LAMPORTS_PER_SOL / 100, // Transfer 0.01 SOL
    })
  );
  solanaTransaction.feePayer = solanaKeypair.publicKey;

  const solanaConnection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  const { blockhash } = await solanaConnection.getLatestBlockhash();
  solanaTransaction.recentBlockhash = blockhash;

  const serializedTransaction = solanaTransaction
    .serialize({
      requireAllSignatures: false, // should be false as we're not signing the message
      verifySignatures: false, // should be false as we're not signing the message
    })
    .toString('base64');

  const unsignedTransaction: SolanaLitTransaction = {
    serializedTransaction,
    chain: 'devnet',
  };

  const signedTx = await signTransactionWithEncryptedKey({
    pkpSessionSigs: pkpSessionSigsSigning,
    network: NETWORK_SOLANA,
    unsignedTransaction,
    broadcast: false,
    litNodeClient: devEnv.litNodeClient,
  });

  console.log('signedTx');
  console.log(signedTx);

  const signatureBuffer = Buffer.from(signedTx, 'base64');
  solanaTransaction.addSignature(solanaKeypair.publicKey, signatureBuffer);

  if (!solanaTransaction.verifySignatures()) {
    throw new Error(
      `Signature: ${signedTx} doesn't validate for the Solana transaction.`
    );
  }

  log('✅ testSignMessageWithSolanaEncryptedKey');
};
