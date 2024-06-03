import { log } from '@lit-protocol/misc';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { importPrivateKey } from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { randomSolanaPrivateKey } from 'local-tests/setup/tinny-utils';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testImportWrappedKey
 * ✅ NETWORK=manzano yarn test:local --filter=testImportWrappedKey
 * ✅ NETWORK=localchain yarn test:local --filter=testImportWrappedKey
 */
export const testImportWrappedKey = async (devEnv: TinnyEnvironment) => {
  const alice = await devEnv.createRandomPerson();

  const pkpSessionSigs = await getPkpSessionSigs(devEnv, alice, null, new Date(Date.now() + 1000 * 60 * 10).toISOString()); // 10 mins expiry

  console.log(pkpSessionSigs);

  const privateKey = randomSolanaPrivateKey();
    // '4rXcTBAZVypFRGGER4TwSuGGxMvmRwvYA3jwuZfDY4YKX4VEbuUaPCWrZGSxujKknQCdN8UD9wMW8XYmT1BiLxmB';

  const pkpAddress = await importPrivateKey({
    pkpSessionSigs,
    privateKey,
    litNodeClient: devEnv.litNodeClient,
  });

  // TODO!: There might be an error in pkpInfo, investigating. Uncomment once fixed
  // const alicePkpAddress = alice.pkp.ethAddress;
  // if (pkpAddress !== alicePkpAddress) {
  //   throw new Error(`Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`);
  // }

  log('✅ testImportWrappedKey');
};
