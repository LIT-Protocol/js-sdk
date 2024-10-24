import { getDecryptedKeyToSingleNode } from '../../internal/common/getDecryptedKeyToSingleNode';
import {
  signTransactionSolanaKey,
  validateUnsignedTransaction,
} from '../../internal/solana/signTransaction';

import type { UnsignedTransaction } from '../../internal/solana/signTransaction';

export interface SignTransactionWithEncryptedSolanaKeyParams {
  accessControlConditions: string;
  ciphertext: string; // The encrypted Wrapped Key
  dataToEncryptHash: string; // The hash of the data to encrypt
  unsignedTransaction: UnsignedTransaction;
  broadcast: boolean; // Flag to determine if the transaction should be broadcasted
}

/**
 *
 * Bundles solana/web3.js package as it's required to sign a transaction with the Solana wallet which is also decrypted inside the Lit Action.
 *
 * @param {SignTransactionWithEncryptedSolanaKeyParams} params - The parameters for signing the transaction
 * @returns { Promise<string> } - Returns the transaction signature. Or returns errors if any.
 */

export async function signTransactionWithEncryptedSolanaKey({
  accessControlConditions,
  ciphertext,
  dataToEncryptHash,
  unsignedTransaction,
  broadcast,
}: SignTransactionWithEncryptedSolanaKeyParams): Promise<string> {
  validateUnsignedTransaction(unsignedTransaction);

  const privateKey = await getDecryptedKeyToSingleNode({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
  });

  return signTransactionSolanaKey({
    broadcast,
    privateKey,
    unsignedTransaction,
  });
}
