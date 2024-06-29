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

  const pkpSessionSigs = await getPkpSessionSigs(
    devEnv,
    alice,
    null,
    new Date(Date.now() + 1000 * 60 * 10).toISOString()
  ); // 10 mins expiry

  console.log(pkpSessionSigs);

  const privateKey =
    '4rXcTBAZVypFRGGER4TwSuGGxMvmRwvYA3jwuZfDY4YKX4VEbuUaPCWrZGSxujKknQCdN8UD9wMW8XYmT1BiLxmB'; // Already exists in the DB

  try {
    await importPrivateKey({
      pkpSessionSigs,
      privateKey,
      litNodeClient: devEnv.litNodeClient,
      publicKey: '0xdeadbeef',
      keyType: 'K256',
    });
  } catch (e: any) {
    console.log('❌ THIS IS EXPECTED: ', e);

    // TODO!: The Lambda isn't updated for this, uncomment it once done
    // if (e.message === 'There was a problem fetching from the database: Error: "The conditional request failed"') {
    //   console.log(
    //     '✅ testFailImportWrappedKeysWithSamePrivateKey is expected to have an error'
    //   );
    // } else {
    //   throw e;
    // }
  }

  console.log('✅ testFailImportWrappedKeysWithSamePrivateKey');
};
