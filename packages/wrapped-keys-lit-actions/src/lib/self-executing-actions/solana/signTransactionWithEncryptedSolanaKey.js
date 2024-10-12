/* global accessControlConditions, ciphertext, dataToEncryptHash, unsignedTransaction, broadcast */

import { signTransactionWithEncryptedSolanaKey } from '../../raw-action-functions/solana/signTransactionWithEncryptedSolanaKey';

(async () =>
  signTransactionWithEncryptedSolanaKey({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
    unsignedTransaction,
    broadcast,
  }))();
