import { getDecryptedKeyToSingleNode } from '../../internal/common/getDecryptedKeyToSingleNode';
import { signMessageEthereumKey } from '../../internal/ethereum/signMessage';

interface SignMessageWithEncryptedEthereumKeyParams {
  accessControlConditions: any; 
  ciphertext: string;
  dataToEncryptHash: string;
  messageToSign: string;
}

/**
 * Signs a message with the Ethers wallet which is also decrypted inside the Lit Action.
 * @param {string} pkpAddress - The Eth address of the PKP which is associated with the Wrapped Key
 * @returns {Promise<string>} - Returns a message signed by the Ethers Wrapped key. Or returns errors if any.
 */
export async function signMessageWithEncryptedEthereumKey({
  accessControlConditions,
  ciphertext,
  dataToEncryptHash,
  messageToSign,
}: SignMessageWithEncryptedEthereumKeyParams): Promise<string> {
  const privateKey = await getDecryptedKeyToSingleNode({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
  });

  return signMessageEthereumKey({
    privateKey,
    messageToSign,
  });
}
