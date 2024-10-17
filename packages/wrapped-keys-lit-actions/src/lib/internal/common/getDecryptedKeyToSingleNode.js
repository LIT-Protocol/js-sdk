/* global Lit */

import { AbortError } from '../../abortError';
import { removeSaltFromDecryptedKey } from '../../utils';

async function tryDecryptToSingleNode({
  accessControlConditions,
  ciphertext,
  dataToEncryptHash,
}) {
  try {
    // May be undefined, since we're using `decryptToSingleNode`
    return await Lit.Actions.decryptToSingleNode({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      chain: 'ethereum',
      authSig: null,
    });
  } catch (err) {
    throw new Error(`When decrypting key to a single node - ${err.message}`);
  }
}

export async function getDecryptedKeyToSingleNode({
  accessControlConditions,
  ciphertext,
  dataToEncryptHash,
}) {
  const decryptedPrivateKey = await tryDecryptToSingleNode({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
  });

  if (!decryptedPrivateKey) {
    // Silently exit on nodes which didn't run the `decryptToSingleNode` code
    throw new AbortError();
  }

  return removeSaltFromDecryptedKey(decryptedPrivateKey);
}
