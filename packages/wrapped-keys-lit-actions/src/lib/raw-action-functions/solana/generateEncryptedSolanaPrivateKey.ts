import { encryptPrivateKey } from '../../internal/common/encryptKey';
import { generateSolanaPrivateKey } from '../../internal/solana/generatePrivateKey';
import type { KEY_SET_IDENTIFIER_VALUES } from '@lit-protocol/constants';

/**
 * Bundles solana/web3.js package as it's required to generate a random Solana key and only allows the provided PKP to decrypt it
 *
 * @param {string} accessControlConditions - The access control condition that allows only the pkpAddress to decrypt the Wrapped Key
 *
 * @returns { Promise<{ciphertext: string, dataToEncryptHash: string, publicKey: string}> } - Returns JSON object with ciphertext & dataToEncryptHash which are the result of the encryption. Also returns the publicKey of the newly generated Solana Wrapped Key.
 */
export interface GenerateEncryptedSolanaPrivateKeyParams {
  accessControlConditions: string;
  keySetIdentifier?: KEY_SET_IDENTIFIER_VALUES;
}

export async function generateEncryptedSolanaPrivateKey({
  accessControlConditions,
  keySetIdentifier,
}: GenerateEncryptedSolanaPrivateKeyParams): Promise<{
  ciphertext: string;
  dataToEncryptHash: string;
  publicKey: string;
}> {
  const { privateKey, publicKey } = generateSolanaPrivateKey();

  return encryptPrivateKey({
    accessControlConditions,
    publicKey,
    privateKey,
    keySetIdentifier,
  });
}
