import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { api } from '@lit-protocol/wrapped-keys';
import { Keypair } from '@solana/web3.js';
import { ethers } from 'ethers';
import nacl from 'tweetnacl';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';

const { importPrivateKey, signMessageWithEncryptedKey } = api;

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testSignMessageWithSolanaEncryptedKey
 * ✅ NETWORK=datil-test yarn test:local --filter=testSignMessageWithSolanaEncryptedKey
 * ✅ NETWORK=custom yarn test:local --filter=testSignMessageWithSolanaEncryptedKey
 */
export const testSignMessageWithSolanaEncryptedKey = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  try {
    const pkpSessionSigs = await getPkpSessionSigs(
      devEnv,
      alice,
      null,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    const solanaKeypair = Keypair.generate();
    const privateKey = Buffer.from(solanaKeypair.secretKey).toString('hex');

    const { pkpAddress, id } = await importPrivateKey({
      pkpSessionSigs,
      privateKey,
      litNodeClient: devEnv.litNodeClient,
      publicKey: '0xdeadbeef',
      keyType: 'K256',
      memo: 'Test key',
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
      ethers.utils.base58.decode(signature),
      solanaKeypair.publicKey.toBuffer()
    );

    if (!signatureIsValidForPublicKey)
      throw new Error(
        `signature: ${signature} doesn't validate for the Solana public key: ${solanaKeypair.publicKey.toString()}`
      );

    console.log('✅ testSignMessageWithSolanaEncryptedKey');
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
