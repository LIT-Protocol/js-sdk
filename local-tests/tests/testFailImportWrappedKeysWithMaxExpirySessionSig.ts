import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { api } from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { randomSolanaPrivateKey } from 'local-tests/setup/tinny-utils';

const { importPrivateKey } = api;

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testFailImportWrappedKeysWithMaxExpirySessionSig
 * ✅ NETWORK=manzano yarn test:local --filter=testFailImportWrappedKeysWithMaxExpirySessionSig
 * ✅ NETWORK=localchain yarn test:local --filter=testFailImportWrappedKeysWithMaxExpirySessionSig
 */
export const testFailImportWrappedKeysWithMaxExpirySessionSig = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  const pkpSessionSigs = await getPkpSessionSigs(devEnv, alice);

  console.log(pkpSessionSigs);

  try {
    const privateKey = randomSolanaPrivateKey();

    await importPrivateKey({
      pkpSessionSigs,
      privateKey,
      litNodeClient: devEnv.litNodeClient,
      address: '0xdeadbeef',
      keyType: 'K256',
    });
  } catch (e: any) {
    console.log('❌ THIS IS EXPECTED: ', e);

    if (
      e.message.includes(
        'There was a problem fetching from the database: Error: Invalid pkpSessionSig: Expiration set beyond permitted expiration minutes of 15'
      )
    ) {
      console.log(
        '✅ testFailImportWrappedKeysWithMaxExpirySessionSig is expected to have an error'
      );
    } else {
      throw e;
    }
  }

  console.log('✅ testFailImportWrappedKeysWithMaxExpirySessionSig');
};
