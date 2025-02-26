import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { api } from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { randomSolanaPrivateKey } from 'local-tests/setup/tinny-utils';

const { importPrivateKey, listEncryptedKeyMetadata } = api;

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testImportWrappedKey
 * ✅ NETWORK=datil-test yarn test:local --filter=testImportWrappedKey
 * ✅ NETWORK=custom yarn test:local --filter=testImportWrappedKey
 */
export const testImportWrappedKey = async (devEnv: TinnyEnvironment) => {
  const alice = await devEnv.createRandomPerson();

  try {
    const pkpSessionSigs = await getPkpSessionSigs(
      devEnv,
      alice,
      null,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    const privateKey = randomSolanaPrivateKey();
    // '4rXcTBAZVypFRGGER4TwSuGGxMvmRwvYA3jwuZfDY4YKX4VEbuUaPCWrZGSxujKknQCdN8UD9wMW8XYmT1BiLxmB';

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

    const keys = await listEncryptedKeyMetadata({
      pkpSessionSigs,
      litNodeClient: devEnv.litNodeClient,
    });

    if (keys.length !== 1 || keys[0].id !== id) {
      throw new Error(
        'Keys returned by `listPrivateKeyMetadata()` do not match expected result.'
      );
    }

    console.log('✅ testImportWrappedKey');
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
