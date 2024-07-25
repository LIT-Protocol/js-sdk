import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { api } from '@lit-protocol/wrapped-keys';
import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { randomSolanaPrivateKey } from 'local-tests/setup/tinny-utils';

const { importPrivateKey } = api;

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

  try {
    const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);

    // console.log(eoaSessionSigs);

    const privateKey = randomSolanaPrivateKey();

    try {
      await importPrivateKey({
        pkpSessionSigs: eoaSessionSigs,
        privateKey,
        litNodeClient: devEnv.litNodeClient,
        publicKey: '0xdeadbeef',
        keyType: 'K256',
        memo: 'Test key',
      });
    } catch (e: any) {
      if (e.message.includes('SessionSig is not from a PKP')) {
        console.log('✅ THIS IS EXPECTED: ', e);
        console.log(e.message);
        console.log(
          '✅ testFailImportWrappedKeysWithEoaSessionSig is expected to have an error'
        );
      } else {
        throw e;
      }
    }

    console.log('✅ testFailImportWrappedKeysWithEoaSessionSig');
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
