import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { api } from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { randomSolanaPrivateKey } from 'local-tests/setup/tinny-utils';

const { importPrivateKey } = api;

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testFailImportWrappedKeysWithSamePkp
 * ✅ NETWORK=manzano yarn test:local --filter=testFailImportWrappedKeysWithSamePkp
 * ✅ NETWORK=localchain yarn test:local --filter=testFailImportWrappedKeysWithSamePkp
 */
export const testFailImportWrappedKeysWithSamePkp = async (
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

  const privateKey1 = randomSolanaPrivateKey();

  const pkpAddress = await importPrivateKey({
    pkpSessionSigs,
    privateKey: privateKey1,
    litNodeClient: devEnv.litNodeClient,
    address: '0xdeadbeef',
    algo: 'K256',
  });

  const alicePkpAddress = alice.authMethodOwnedPkp.ethAddress;
  if (pkpAddress !== alicePkpAddress) {
    throw new Error(
      `Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`
    );
  }

  console.log('✅ testFailImportWrappedKeysWithSamePkp');

  try {
    const privateKey2 = randomSolanaPrivateKey();

    await importPrivateKey({
      pkpSessionSigs,
      privateKey: privateKey2,
      litNodeClient: devEnv.litNodeClient,
      address: '0xdeadbeef',
      algo: 'K256',
    });
  } catch (e: any) {
    console.log('❌ THIS IS EXPECTED: ', e);

    if (
      e.message ===
      'There was a problem fetching from the database: Error: "The conditional request failed"'
    ) {
      console.log(
        '✅ testFailImportWrappedKeysWithSamePkp is expected to have an error'
      );
    } else {
      throw e;
    }
  }

  console.log('✅ testFailImportWrappedKeysWithSamePkp');
};
