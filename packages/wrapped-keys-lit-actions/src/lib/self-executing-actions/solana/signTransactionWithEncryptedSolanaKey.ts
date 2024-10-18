/* global accessControlConditions, ciphertext, dataToEncryptHash, unsignedTransaction, broadcast */

import { UnsignedTransaction } from '../../internal/ethereum/signTransaction';
import { litActionHandler } from '../../litActionHandler';
import { signTransactionWithEncryptedSolanaKey } from '../../raw-action-functions/solana/signTransactionWithEncryptedSolanaKey';

declare global {
  var accessControlConditions: string
  var ciphertext: any;
  var dataToEncryptHash: any;
  var unsignedTransaction: UnsignedTransaction;
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
