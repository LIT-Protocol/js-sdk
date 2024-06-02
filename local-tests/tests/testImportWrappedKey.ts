import { log } from '@lit-protocol/misc';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { importPrivateKey } from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testImportWrappedKey
 * ✅ NETWORK=manzano yarn test:local --filter=testImportWrappedKey
 * ✅ NETWORK=localchain yarn test:local --filter=testImportWrappedKey
 */
export const testImportWrappedKey = async (devEnv: TinnyEnvironment) => {
  const alice = await devEnv.createRandomPerson();

  const pkpSessionSigs = await getPkpSessionSigs(devEnv, alice);

  console.log(pkpSessionSigs);

  const privateKey = randomSolanaPrivateKey();
    // '4rXcTBAZVypFRGGER4TwSuGGxMvmRwvYA3jwuZfDY4YKX4VEbuUaPCWrZGSxujKknQCdN8UD9wMW8XYmT1BiLxmB';

  const pkpAddress = await importPrivateKey({
    pkpSessionSigs,
    privateKey,
    litNodeClient: devEnv.litNodeClient,
  });

  expect(pkpAddress).equal(alice.pkp.ethAddress);

  log('✅ testImportWrappedKey');
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
