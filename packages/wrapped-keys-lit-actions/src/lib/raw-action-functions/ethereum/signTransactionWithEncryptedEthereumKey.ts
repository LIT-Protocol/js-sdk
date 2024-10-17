import { getDecryptedKeyToSingleNode } from '../../internal/common/getDecryptedKeyToSingleNode';
import { signTransactionEthereumKey, getValidatedUnsignedTx } from '../../internal/ethereum/signTransaction';

interface SignTransactionWithEncryptedEthereumKeyParams {
  accessControlConditions: any; 
  ciphertext: string;
  dataToEncryptHash: string;
  unsignedTransaction: any; 
  broadcast: boolean;
}

/**
 * 
 * Signs a transaction with the Ethers wallet whose private key is decrypted inside the Lit Action.
 * @returns {Promise<string>} - Returns the transaction hash if broadcast is set as true else returns only the signed transaction. Or returns errors if any.
 */
export async function signTransactionWithEncryptedEthereumKey({
  accessControlConditions,
  ciphertext,
  dataToEncryptHash,
  unsignedTransaction,
  broadcast,
}: SignTransactionWithEncryptedEthereumKeyParams): Promise<string> {
  const validatedTx = getValidatedUnsignedTx(unsignedTransaction);

  const privateKey = await getDecryptedKeyToSingleNode({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
  });

  return signTransactionEthereumKey({
    broadcast,
    privateKey,
    unsignedTransaction,
    validatedTx,
  });
}
