import { log } from '@lit-protocol/misc';
import { ethers } from 'ethers';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { api } from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';

const { importPrivateKey, signTypedDataWithEncryptedKey } = api;

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testFailEthereumSignTypedDataWrappedKeyInvalidDecryption
 * ✅ NETWORK=datil-test yarn test:local --filter=testFailEthereumSignTypedDataWrappedKeyInvalidDecryption
 * ✅ NETWORK=custom yarn test:local --filter=testFailEthereumSignTypedDataWrappedKeyInvalidDecryption
 */
export const testFailEthereumSignTypedDataWrappedKeyInvalidDecryption = async (
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

    const aliceWrappedKey = ethers.Wallet.createRandom();
    const privateKey = aliceWrappedKey.privateKey;
    const aliceWrappedKeyAddress = aliceWrappedKey.address;

    const { pkpAddress, id } = await importPrivateKey({
      pkpSessionSigs,
      privateKey,
      litNodeClient: devEnv.litNodeClient,
      publicKey: aliceWrappedKeyAddress,
      keyType: 'K256',
      memo: 'Test key',
    });

    const alicePkpAddress = alice.authMethodOwnedPkp.ethAddress;
    if (pkpAddress !== alicePkpAddress) {
      throw new Error(
        `Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`
      );
    }

    // Use a different user's session sigs to try to decrypt the key
    const bob = await devEnv.createRandomPerson();
    const bobPkpSessionSigs = await getPkpSessionSigs(
      devEnv,
      bob,
      null,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    const typedData = {
      domain: {
        name: 'TestApp',
        version: '1',
        chainId: 1,
        verifyingContract: '0x1234567890123456789012345678901234567890',
      },
      types: {
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
        ],
      },
      value: {
        from: alice.wallet.address,
        to: '0x1234567890123456789012345678901234567890',
        contents: 'Hello, Bob!',
      },
    };

    try {
      const _res = await signTypedDataWithEncryptedKey({
        pkpSessionSigs: bobPkpSessionSigs, // Using Bob's session sigs to try to decrypt Alice's key
        network: 'evm',
        messageToSign: typedData,
        litNodeClient: devEnv.litNodeClient,
        id, // Alice's key ID
      });
    } catch (e: any) {
      if (e.message.includes('Could not find')) {
        console.log('✅ THIS IS EXPECTED: ', e);
        console.log(e.message);
        console.log(
          '✅ testFailEthereumSignTypedDataWrappedKeyInvalidDecryption is expected to have an error'
        );
      } else {
        console.log('ERROR', e.message);
        throw e;
      }
    }

    log('✅ testFailEthereumSignTypedDataWrappedKeyInvalidDecryption');
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
