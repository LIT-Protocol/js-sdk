import { getDecryptedKeyToSingleNode } from '../../internal/common/getDecryptedKeyToSingleNode';
import {
  signTransactionEthereumKey,
  getValidatedUnsignedTx,
  UnsignedTransaction,
} from '../../internal/ethereum/signTransaction';
import type { KEY_SET_IDENTIFIER_VALUES } from '@lit-protocol/constants';

export interface SignTransactionWithEncryptedEthereumKeyParams {
  accessControlConditions: string;
  ciphertext: string;
  dataToEncryptHash: string;
  unsignedTransaction: UnsignedTransaction;
  broadcast: boolean;
  keySetIdentifier?: KEY_SET_IDENTIFIER_VALUES;
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
  keySetIdentifier,
}: SignTransactionWithEncryptedEthereumKeyParams): Promise<string> {
  const validatedTx = getValidatedUnsignedTx(unsignedTransaction);

  const privateKey = await getDecryptedKeyToSingleNode({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
    keySetIdentifier,
  });

  return signTransactionEthereumKey({
    broadcast,
    privateKey,
    unsignedTransaction,
    validatedTx,
  });
}
