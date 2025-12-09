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
    console.log(`   Generated id=${id} for pkpAddress=${pkpAddress}`);

    console.log('3. Fetch initial encrypted key (without versions)');
    const initial = await getEncryptedKey({
      pkpSessionSigs,
      litNodeClient: devEnv.litNodeClient,
      id,
    });
    console.log(
      `   Initial ciphertext hash=${initial.dataToEncryptHash} memo="${initial.memo}"`
    );
    const newCiphertext = randomBytes(48).toString('base64');

    console.log('4. Update encrypted key with new ciphertext/memo');
    const updateResult = await updateEncryptedKey({
      pkpSessionSigs,
      litNodeClient: devEnv.litNodeClient,
      id,
      ciphertext: newCiphertext,
      memo: 'rotated memo',
    });
    console.log(
      `   Update result: id=${updateResult.id} pkpAddress=${updateResult.pkpAddress} updatedAt=${updateResult.updatedAt}`
    );

    if (updateResult.pkpAddress !== pkpAddress) {
      throw new Error('Updated key pkpAddress mismatch');
    }

    console.log('5. Fetch updated key including versions');
    const updated = await getEncryptedKey({
      pkpSessionSigs,
      litNodeClient: devEnv.litNodeClient,
      id,
      includeVersions: true,
    });
    console.log(
      `   Updated ciphertext=${updated.ciphertext.slice(0, 16)}... versions=${updated.versions?.length}`
    );

    if (updated.ciphertext !== newCiphertext) {
      throw new Error('Ciphertext was not updated');
    }
    if (!updated.versions || updated.versions.length !== 1) {
      throw new Error('Versions array missing or incorrect length');
    }
    if (updated.versions[0].ciphertext !== initial.ciphertext) {
      throw new Error('Previous version ciphertext mismatch');
    }
    if (!updated.updatedAt || !updated.versions[0].updatedAt) {
      throw new Error('updatedAt timestamps not set');
    }

    log('✅ testUpdateWrappedKey');
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
