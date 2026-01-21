import { LIT_PREFIX } from '../../constants';
import type { KEY_SET_IDENTIFIER_VALUES } from '@lit-protocol/constants';

/* global Lit */

/**
 * @private
 * @returns { Promise<{ciphertext: string, dataToEncryptHash: string, publicKey: string}> } - The ciphertext & dataToEncryptHash which are the result of the encryption, and the publicKey of the newly generated Ethers Wrapped Key.
 */
export async function encryptPrivateKey({
  accessControlConditions,
  privateKey,
  publicKey,
  keySetIdentifier,
}: {
  accessControlConditions: string;
  privateKey: string;
  publicKey: string;
  keySetIdentifier?: KEY_SET_IDENTIFIER_VALUES;
}): Promise<{
  ciphertext: string;
  dataToEncryptHash: string;
  publicKey: string;
}> {
  const { ciphertext, dataToEncryptHash } = await Lit.Actions.encrypt({
    accessControlConditions,
    to_encrypt: new TextEncoder().encode(LIT_PREFIX + privateKey),
    keySetIdentifier,
  });

  return {
    ciphertext,
    dataToEncryptHash,
    publicKey,
  };
}
