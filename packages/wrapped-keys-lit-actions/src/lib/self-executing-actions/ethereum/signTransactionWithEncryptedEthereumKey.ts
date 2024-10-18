/* global accessControlConditions, ciphertext, dataToEncryptHash, unsignedTransaction, broadcast */

import { UnsignedTransaction } from '../../internal/ethereum/signTransaction';
import { litActionHandler } from '../../litActionHandler';
import { signTransactionWithEncryptedEthereumKey } from '../../raw-action-functions/ethereum/signTransactionWithEncryptedEthereumKey';

declare global {
  var accessControlConditions: string
  var ciphertext: any;
  var dataToEncryptHash: any;
  var unsignedTransaction: UnsignedTransaction;
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
