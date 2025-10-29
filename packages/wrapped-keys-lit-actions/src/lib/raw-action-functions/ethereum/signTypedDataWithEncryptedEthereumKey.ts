import { getDecryptedKeyToSingleNode } from '../../internal/common/getDecryptedKeyToSingleNode';
import { signTypedDataEthereumKey } from '../../internal/ethereum/signTypedData';

interface TypedDataField {
  name: string;
  type: string;
}
interface TypedDataMessage {
  domain: {
    name?: string;
    version?: string;
    chainId?: number | string | bigint;
    verifyingContract?: string;
    salt?: string;
  };
  types: Record<string, TypedDataField[]>;
  value: Record<string, string | number>;
}
export interface SignTypedDataWithEncryptedEthereumKeyParams {
  accessControlConditions: string;
  ciphertext: string;
  dataToEncryptHash: string;
  messageToSign: TypedDataMessage;
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
