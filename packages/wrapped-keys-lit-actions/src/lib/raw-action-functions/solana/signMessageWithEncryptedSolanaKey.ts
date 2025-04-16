import { getDecryptedKeyToSingleNode } from '../../internal/common/getDecryptedKeyToSingleNode';
import { signMessageSolanaKey } from '../../internal/solana/signMessage';

export interface SignMessageWithEncryptedSolanaKeyParams {
  accessControlConditions: string;
  ciphertext: string;
  dataToEncryptHash: string;
  messageToSign: string;
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
}: SignMessageWithEncryptedSolanaKeyParams): Promise<string> {
  const privateKey = await getDecryptedKeyToSingleNode({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
  });

  return signMessageSolanaKey({
    messageToSign,
    privateKey,
  });
}
