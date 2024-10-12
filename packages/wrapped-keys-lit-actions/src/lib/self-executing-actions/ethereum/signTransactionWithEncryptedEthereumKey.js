/* global accessControlConditions, ciphertext, dataToEncryptHash, unsignedTransaction, broadcast */

import { litActionHandler } from '../../litActionHandler';
import { signTransactionWithEncryptedEthereumKey } from '../../raw-action-functions/ethereum/signTransactionWithEncryptedEthereumKey';

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
