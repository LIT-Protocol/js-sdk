/* global accessControlConditions, ciphertext, dataToEncryptHash, unsignedTransaction, broadcast */

import { litActionHandler } from '../../litActionHandler';
import { signTransactionWithEncryptedSolanaKey } from '../../raw-action-functions/solana/signTransactionWithEncryptedSolanaKey';

declare global {
  var accessControlConditions: any;
  var ciphertext: any;
  var dataToEncryptHash: any;
  var unsignedTransaction: any;
  var broadcast: any;
}

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
