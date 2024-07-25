import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { api } from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';

const { importPrivateKey } = api;
/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testFailImportWrappedKeysWithSamePrivateKey
 * ✅ NETWORK=manzano yarn test:local --filter=testFailImportWrappedKeysWithSamePrivateKey
 * ✅ NETWORK=localchain yarn test:local --filter=testFailImportWrappedKeysWithSamePrivateKey
 */
export const testFailImportWrappedKeysWithSamePrivateKey = async (
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

    const privateKey =
      '4rXcTBAZVypFRGGER4TwSuGGxMvmRwvYA3jwuZfDY4YKX4VEbuUaPCWrZGSxujKknQCdN8UD9wMW8XYmT1BiLxmB'; // Already exists in the DB

    try {
      await importPrivateKey({
        pkpSessionSigs,
        privateKey,
        litNodeClient: devEnv.litNodeClient,
        publicKey: '0xdeadbeef',
        keyType: 'K256',
        memo: 'Test key',
      });

      await importPrivateKey({
        pkpSessionSigs,
        privateKey,
        litNodeClient: devEnv.litNodeClient,
        publicKey: '0xdeadbeef',
        keyType: 'K256',
        memo: 'Test key',
      });

      throw new Error(
        'Expected an AlreadyExists error but the importPrivateKey succeeded!'
      );
    } catch (e: any) {
      if (
        e.message.includes(
          'There is already a wrapped key stored with the same dataToEncryptHash'
        )
      ) {
        console.log('✅ THIS IS EXPECTED: ', e);
        console.log(e.message);
        console.log(
          '✅ testFailImportWrappedKeysWithSamePrivateKey is expected to have an error'
        );
      } else {
        throw e;
      }
    }

    console.log('✅ testFailImportWrappedKeysWithSamePrivateKey');
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
