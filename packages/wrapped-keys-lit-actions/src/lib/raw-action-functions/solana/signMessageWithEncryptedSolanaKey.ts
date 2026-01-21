import { getDecryptedKeyToSingleNode } from '../../internal/common/getDecryptedKeyToSingleNode';
import { signMessageSolanaKey } from '../../internal/solana/signMessage';
import type { KEY_SET_IDENTIFIER_VALUES } from '@lit-protocol/constants';

export interface SignMessageWithEncryptedSolanaKeyParams {
  accessControlConditions: string;
  ciphertext: string;
  dataToEncryptHash: string;
  messageToSign: string;
  keySetIdentifier?: KEY_SET_IDENTIFIER_VALUES;
}

/**
 *
 * Bundles solana/web3.js package as it's required to sign a message with the Solana wallet which is also decrypted inside the Lit Action.
 * @param { SignMessageWithEncryptedSolanaKeyParams } params - The access control condition that allows only the pkpAddress to decrypt the Wrapped Key
 * @returns {Promise<string>} - Returns a message signed by the Solana Wrapped key. Or returns errors if any.
 */
export async function signMessageWithEncryptedSolanaKey({
  accessControlConditions,
  ciphertext,
  dataToEncryptHash,
  messageToSign,
  keySetIdentifier,
}: SignMessageWithEncryptedSolanaKeyParams): Promise<string> {
  const privateKey = await getDecryptedKeyToSingleNode({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
    keySetIdentifier,
  });

  return signMessageSolanaKey({
    messageToSign,
    privateKey,
  });
}
