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

  const privateKey = "4rXcTBAZVypFRGGER4TwSuGGxMvmRwvYA3jwuZfDY4YKX4VEbuUaPCWrZGSxujKknQCdN8UD9wMW8XYmT1BiLxmB";

  const res = await importPrivateKey({ pkpSessionSigs, privateKey, litNodeClient: devEnv.litNodeClient });
  console.log("res- ", res);

  log('✅ testImportWrappedKey');
};
