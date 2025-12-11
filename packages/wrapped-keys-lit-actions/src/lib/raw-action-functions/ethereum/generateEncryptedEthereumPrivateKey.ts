/**
 *
 * Generates a random Ethers private key and only allows the provided PKP to decrypt it
 *
 * @param {string} pkpAddress - The Eth address of the PKP which is associated with the Wrapped Key
 * @param {string} accessControlConditions - The access control condition that allows only the pkpAddress to decrypt the Wrapped Key
 *
 * @returns { Promise<{ciphertext: string, dataToEncryptHash: string, publicKey: string}> } - Returns object with ciphertext & dataToEncryptHash which are the result of the encryption. Also returns the publicKey of the newly generated Ethers Wrapped Key.
 */
import type { KEY_SET_IDENTIFIER_VALUES } from '@lit-protocol/constants';
import { encryptPrivateKey } from '../../internal/common/encryptKey';
import { generateEthereumPrivateKey } from '../../internal/ethereum/generatePrivateKey';

export interface GenerateEncryptedEthereumPrivateKeyParams {
  accessControlConditions: string;
  keySetIdentifier?: KEY_SET_IDENTIFIER_VALUES;
}

export async function generateEncryptedEthereumPrivateKey({
  accessControlConditions,
  keySetIdentifier,
}: GenerateEncryptedEthereumPrivateKeyParams): Promise<{
  ciphertext: string;
  dataToEncryptHash: string;
  publicKey: string;
}> {
  const { privateKey, publicKey } = generateEthereumPrivateKey();
  return encryptPrivateKey({
    accessControlConditions,
    privateKey,
    publicKey,
    keySetIdentifier,
  });
}
