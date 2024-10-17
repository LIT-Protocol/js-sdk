/* global accessControlConditions, ciphertext, dataToEncryptHash, unsignedTransaction, broadcast */

import { litActionHandler } from '../../litActionHandler';
import { signTransactionWithEncryptedEthereumKey } from '../../raw-action-functions/ethereum/signTransactionWithEncryptedEthereumKey';

declare global {
  var accessControlConditions: any;
  var ciphertext: any;
  var dataToEncryptHash: any;
  var unsignedTransaction: any;
  var broadcast: any;
}

(async () =>
  litActionHandler(async () =>
    signTransactionWithEncryptedEthereumKey({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      unsignedTransaction,
      broadcast,
    })
  ))();
