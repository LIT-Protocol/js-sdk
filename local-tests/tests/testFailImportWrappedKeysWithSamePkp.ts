import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { importPrivateKey } from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testFailImportWrappedKeysWithSamePkp
 * ✅ NETWORK=manzano yarn test:local --filter=testFailImportWrappedKeysWithSamePkp
 * ✅ NETWORK=localchain yarn test:local --filter=testFailImportWrappedKeysWithSamePkp
 */
export const testFailImportWrappedKeysWithSamePkp = async (devEnv: TinnyEnvironment) => {
  const alice = await devEnv.createRandomPerson();

  const pkpSessionSigs = await getPkpSessionSigs(devEnv, alice);

  console.log(pkpSessionSigs);

  const privateKey1 = randomSolanaPrivateKey();

  const pkpAddress = await importPrivateKey({
    pkpSessionSigs,
    privateKey: privateKey1,
    litNodeClient: devEnv.litNodeClient,
  });

  // TODO!: There might be an error in pkpInfo, investigating. Uncomment once fixed
  // const alicePkpAddress = alice.pkp.ethAddress;
  // if (pkpAddress !== alicePkpAddress) {
  //   throw new Error(`Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`);
  // }

  console.log('✅ testFailImportWrappedKeysWithSamePkp');

  try {
    const privateKey2 = randomSolanaPrivateKey();

    await importPrivateKey({
      pkpSessionSigs,
      privateKey: privateKey2,
      litNodeClient: devEnv.litNodeClient,
    });
  } catch(e: any) {
    console.log('❌ THIS IS EXPECTED: ', e);

    if (e.message === 'There was a problem fetching from the database: Error: "The conditional request failed"') {
      console.log(
        '✅ testFailImportWrappedKeysWithSamePkp is expected to have an error'
      );
    } else {
      throw e;
    }
  }

  console.log('✅ testFailImportWrappedKeysWithSamePkp');
};

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const SOLANA_PRIVATE_KEY_LENGTH = 88;

function randomSolanaPrivateKey() {
    let result = '';
    const charactersLength = BASE58_ALPHABET.length;
    for (let i = 0; i < SOLANA_PRIVATE_KEY_LENGTH; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += BASE58_ALPHABET.charAt(randomIndex);
    }
    return result;
}
