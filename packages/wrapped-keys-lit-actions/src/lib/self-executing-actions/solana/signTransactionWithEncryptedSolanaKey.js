/* global accessControlConditions, ciphertext, dataToEncryptHash, unsignedTransaction, broadcast */

import { litActionHandler } from '../../litActionHandler';
import { signTransactionWithEncryptedSolanaKey } from '../../raw-action-functions/solana/signTransactionWithEncryptedSolanaKey';

(async () =>
  litActionHandler(async () =>
    signTransactionWithEncryptedSolanaKey({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      unsignedTransaction,
      broadcast,
    })
  ))();
