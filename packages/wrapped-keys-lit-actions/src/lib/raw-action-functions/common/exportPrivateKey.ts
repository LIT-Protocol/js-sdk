import { getDecryptedKeyToSingleNode } from '../../internal/common/getDecryptedKeyToSingleNode';

interface ExportPrivateKeyParams {
  accessControlConditions: string
  ciphertext: string;
  dataToEncryptHash: string;
}

/**
 *
 * Exports the private key after decrypting and removing the salt from it.
 *
 * @param {string} pkpAddress - The Eth address of the PKP which is associated with the Wrapped Key
 * @param {string} ciphertext - For the encrypted Wrapped Key
 * @param {string} dataToEncryptHash - For the encrypted Wrapped Key
 * @param {any} accessControlConditions - The access control condition that allows only the pkpAddress to decrypt the Wrapped Key
 *
 * @returns { Promise<string> } - Returns a decrypted private key.
 */

export async function exportPrivateKey({
  accessControlConditions,
  ciphertext,
  dataToEncryptHash,
}: ExportPrivateKeyParams): Promise<string> {
  return getDecryptedKeyToSingleNode({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
  });
}
