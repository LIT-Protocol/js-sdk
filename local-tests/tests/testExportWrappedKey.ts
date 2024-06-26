import { log } from '@lit-protocol/misc';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { api } from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { randomSolanaPrivateKey } from 'local-tests/setup/tinny-utils';

const { exportPrivateKey, importPrivateKey } = api;
/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testExportWrappedKey
 * ✅ NETWORK=manzano yarn test:local --filter=testExportWrappedKey
 * ✅ NETWORK=localchain yarn test:local --filter=testExportWrappedKey
 */
export const testExportWrappedKey = async (devEnv: TinnyEnvironment) => {
  const alice = await devEnv.createRandomPerson();

  const pkpSessionSigsImport = await getPkpSessionSigs(
    devEnv,
    alice,
    null,
    new Date(Date.now() + 1000 * 60 * 10).toISOString()
  ); // 10 mins expiry

  console.log(pkpSessionSigsImport);

  const privateKey = randomSolanaPrivateKey();

  const pkpAddress = await importPrivateKey({
    pkpSessionSigs: pkpSessionSigsImport,
    privateKey,
    litNodeClient: devEnv.litNodeClient,
    address: '0xdeadbeef',
    keyType: 'K256',
  });

  const alicePkpAddress = alice.authMethodOwnedPkp.ethAddress;
  if (pkpAddress !== alicePkpAddress) {
    throw new Error(
      `Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`
    );
  }

  const pkpSessionSigsExport = await getPkpSessionSigs(
    devEnv,
    alice,
    null,
    new Date(Date.now() + 1000 * 60 * 10).toISOString()
  ); // 10 mins expiry

  console.log(pkpSessionSigsExport);

  const { decryptedPrivateKey } = await exportPrivateKey({
    pkpSessionSigs: pkpSessionSigsExport,
    litNodeClient: devEnv.litNodeClient,
  });

  if (decryptedPrivateKey !== privateKey) {
    throw new Error(
      `Decrypted private key: ${decryptedPrivateKey} doesn't match with the original private key: ${privateKey}`
    );
  }

  log('✅ testExportWrappedKey');
};
