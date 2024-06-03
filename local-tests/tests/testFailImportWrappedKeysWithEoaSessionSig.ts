import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { importPrivateKey } from '@lit-protocol/wrapped-keys';
import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { randomSolanaPrivateKey } from 'local-tests/setup/tinny-utils';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testFailImportWrappedKeysWithEoaSessionSig
 * ✅ NETWORK=manzano yarn test:local --filter=testFailImportWrappedKeysWithEoaSessionSig
 * ✅ NETWORK=localchain yarn test:local --filter=testFailImportWrappedKeysWithEoaSessionSig
 */
export const testFailImportWrappedKeysWithEoaSessionSig = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);

  console.log(eoaSessionSigs);

  const privateKey = randomSolanaPrivateKey();

  try {
    await importPrivateKey({
      pkpSessionSigs: eoaSessionSigs,
      privateKey,
      litNodeClient: devEnv.litNodeClient,
    });
  } catch (e: any) {
    console.log('❌ THIS IS EXPECTED: ', e);
    console.log(e.message);

    if (e.message === 'SessionSig is not from a PKP') {
      console.log(
        '✅ testFailImportWrappedKeysWithEoaSessionSig is expected to have an error'
      );
    } else {
      throw e;
    }
  }

  console.log('✅ testFailImportWrappedKeysWithEoaSessionSig');
};
