import { log } from '@lit-protocol/misc';
import { randomBytes } from 'crypto';

import { api } from '@lit-protocol/wrapped-keys';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';

const { generatePrivateKey, getEncryptedKey, updateEncryptedKey } = api;

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testUpdateWrappedKey
 * ✅ NETWORK=datil-test yarn test:local --filter=testUpdateWrappedKey
 * ✅ NETWORK=custom yarn test:local --filter=testUpdateWrappedKey
 */
export const testUpdateWrappedKey = async (devEnv: TinnyEnvironment) => {
  const alice = await devEnv.createRandomPerson();

  try {
    console.log('1. Fetch PKP session sigs');
    const pkpSessionSigs = await getPkpSessionSigs(
      devEnv,
      alice,
      null,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    console.log('2. Generate a wrapped key');
    const { id, pkpAddress } = await generatePrivateKey({
      pkpSessionSigs,
      network: 'evm',
      litNodeClient: devEnv.litNodeClient,
      memo: 'Test update key',
    });
    console.log({ id, pkpAddress });

    console.log('3. Fetch initial encrypted key (without versions)');
    const getEncryptedKeyFirst = await getEncryptedKey({
      pkpSessionSigs,
      litNodeClient: devEnv.litNodeClient,
      id,
    });
    console.log({ getEncryptedKeyFirst });
    const newCiphertext1 = randomBytes(48).toString('base64');
    const newCiphertext2 = randomBytes(48).toString('base64');

    console.log('4. Update encrypted key with new ciphertext/memo');
    const updateEncryptedKeyFirst = await updateEncryptedKey({
      pkpSessionSigs,
      litNodeClient: devEnv.litNodeClient,
      id,
      ciphertext: newCiphertext1,
      memo: 'rotated memo',
    });
    console.log({ updateEncryptedKeyFirst });

    if (updateEncryptedKeyFirst.pkpAddress !== pkpAddress) {
      throw new Error('Updated key pkpAddress mismatch');
    }

    console.log('5. Second update to generate another version');
    const updateEncryptedKeySecond = await updateEncryptedKey({
      pkpSessionSigs,
      litNodeClient: devEnv.litNodeClient,
      id,
      ciphertext: newCiphertext2,
      memo: 'rotated memo v2',
    });
    console.log({ updateEncryptedKeySecond });

    console.log('6. Fetch updated key including versions');
    const getEncryptedKeyUpdated = await getEncryptedKey({
      pkpSessionSigs,
      litNodeClient: devEnv.litNodeClient,
      id,
      includeVersions: true,
    });
    console.log({ getEncryptedKeyUpdated });

    if (getEncryptedKeyUpdated.ciphertext !== newCiphertext2) {
      throw new Error('Ciphertext was not updated');
    }
    if (
      !getEncryptedKeyUpdated.versions ||
      getEncryptedKeyUpdated.versions.length !== 2
    ) {
      throw new Error('Versions array missing or incorrect length');
    }
    if (
      getEncryptedKeyUpdated.versions[0].ciphertext !==
      getEncryptedKeyFirst.ciphertext
    ) {
      throw new Error('Initial version ciphertext mismatch');
    }
    if (getEncryptedKeyUpdated.versions[1].ciphertext !== newCiphertext1) {
      throw new Error('First update version ciphertext mismatch');
    }
    if (
      !getEncryptedKeyUpdated.updatedAt ||
      !getEncryptedKeyUpdated.versions[0].updatedAt ||
      !getEncryptedKeyUpdated.versions[1].updatedAt
    ) {
      throw new Error('updatedAt timestamps not set');
    }

    log('✅ testUpdateWrappedKey');
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
