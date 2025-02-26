import { TinnyEnvironment } from '../../setup/tinny-environment';
import { api } from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from '../../setup/session-sigs/get-pkp-session-sigs';
import { randomSolanaPrivateKey } from '../../setup/tinny-utils';

const { exportPrivateKey, importPrivateKey } = api;
/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testExportWrappedKey
 * ✅ NETWORK=datil-test yarn test:local --filter=testExportWrappedKey
 * ✅ NETWORK=custom yarn test:local --filter=testExportWrappedKey
 */
export const testExportWrappedKey = async (devEnv: TinnyEnvironment) => {
  const alice = await devEnv.createRandomPerson();

  try {
    const pkpSessionSigsImport = await getPkpSessionSigs(
      devEnv,
      alice,
      null,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    // console.log(pkpSessionSigsImport);

    const privateKey = randomSolanaPrivateKey();

    const { pkpAddress, id } = await importPrivateKey({
      pkpSessionSigs: pkpSessionSigsImport,
      privateKey,
      litNodeClient: devEnv.litNodeClient,
      publicKey: '0xdeadbeef',
      keyType: 'K256',
      memo: 'Test key',
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

    // console.log(pkpSessionSigsExport);

    const { decryptedPrivateKey } = await exportPrivateKey({
      pkpSessionSigs: pkpSessionSigsExport,
      litNodeClient: devEnv.litNodeClient,
      network: 'solana',
      id,
    });

    if (decryptedPrivateKey !== privateKey) {
      throw new Error(
        `Decrypted private key: ${decryptedPrivateKey} doesn't match with the original private key: ${privateKey}`
      );
    }

    console.log('✅ testExportWrappedKey');
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
