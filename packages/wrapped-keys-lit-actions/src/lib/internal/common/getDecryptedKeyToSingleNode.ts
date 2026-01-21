/* global Lit */

import { AbortError } from '../../abortError';
import { removeSaltFromDecryptedKey } from '../../utils';
import type { KEY_SET_IDENTIFIER_VALUES } from '@lit-protocol/constants';

interface TryDecryptToSingleNodeParams {
  accessControlConditions: string;
  ciphertext: string;
  dataToEncryptHash: string;
  keySetIdentifier?: KEY_SET_IDENTIFIER_VALUES;
}

async function tryDecryptToSingleNode({
  accessControlConditions,
  ciphertext,
  dataToEncryptHash,
  keySetIdentifier,
}: TryDecryptToSingleNodeParams): Promise<string | undefined> {
  try {
    // May be undefined, since we're using `decryptToSingleNode`
    return await Lit.Actions.decryptToSingleNode({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      chain: 'ethereum',
      authSig: null,
      keySetIdentifier,
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
  keySetIdentifier?: KEY_SET_IDENTIFIER_VALUES;
}

export async function getDecryptedKeyToSingleNode({
  accessControlConditions,
  ciphertext,
  dataToEncryptHash,
  keySetIdentifier,
}: GetDecryptedKeyToSingleNodeParams): Promise<string> {
  const decryptedPrivateKey = await tryDecryptToSingleNode({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
    keySetIdentifier,
  });

  if (!decryptedPrivateKey) {
    // Silently exit on nodes which didn't run the `decryptToSingleNode` code
    throw new AbortError();
  }

  return removeSaltFromDecryptedKey(decryptedPrivateKey);
}
