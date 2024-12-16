/* global Lit */

import { AbortError } from '../../abortError';
import { removeSaltFromDecryptedKey } from '../../utils';

interface TryDecryptToSingleNodeParams {
  accessControlConditions: string;
  ciphertext: string;
  dataToEncryptHash: string;
}

async function tryDecryptToSingleNode({
  accessControlConditions,
  ciphertext,
  dataToEncryptHash,
}: TryDecryptToSingleNodeParams): Promise<string | undefined> {
  try {
    // May be undefined, since we're using `decryptToSingleNode`
    return await Lit.Actions.decryptToSingleNode({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      chain: 'ethereum',
      authSig: null,
    });
  } catch (err: unknown) {
    throw new Error(
      `When decrypting key to a single node - ${(err as Error).message}`
    );
  }
}

interface GetDecryptedKeyToSingleNodeParams {
  accessControlConditions: string; // Define a more specific type if possible
  ciphertext: string; // Define a more specific type if possible
  dataToEncryptHash: string; // Define a more specific type if possible
}

export async function getDecryptedKeyToSingleNode({
  accessControlConditions,
  ciphertext,
  dataToEncryptHash,
}: GetDecryptedKeyToSingleNodeParams): Promise<string> {
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
