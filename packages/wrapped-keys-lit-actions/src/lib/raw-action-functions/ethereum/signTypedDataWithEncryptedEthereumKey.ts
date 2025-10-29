import { getDecryptedKeyToSingleNode } from '../../internal/common/getDecryptedKeyToSingleNode';
import { signTypedDataEthereumKey } from '../../internal/ethereum/signTypedData';

export interface SignTypedDataWithEncryptedEthereumKeyParams {
  accessControlConditions: string;
  ciphertext: string;
  dataToEncryptHash: string;
  messageToSign: {
    domain: any;
    types: Record<string, any[]>;
    value: Record<string, any>;
  };
}

/**
 * Signs a message with the Ethers wallet which is also decrypted inside the Lit Action.
 * @param {string} pkpAddress - The Eth address of the PKP which is associated with the Wrapped Key
 * @returns {Promise<string>} - Returns a message signed by the Ethers Wrapped key. Or returns errors if any.
 */
export async function signTypedDataWithEncryptedEthereumKey({
  accessControlConditions,
  ciphertext,
  dataToEncryptHash,
  messageToSign,
}: SignTypedDataWithEncryptedEthereumKeyParams): Promise<string> {
  const privateKey = await getDecryptedKeyToSingleNode({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
  });

  return signTypedDataEthereumKey({
    privateKey,
    messageToSign,
  });
}
