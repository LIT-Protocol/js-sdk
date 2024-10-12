/* global accessControlConditions, ciphertext, dataToEncryptHash, unsignedTransaction, broadcast */

import { signTransactionWithEncryptedEthereumKey } from '../../raw-action-functions/ethereum/signTransactionWithEncryptedEthereumKey';

(async () =>
  signTransactionWithEncryptedEthereumKey({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
    unsignedTransaction,
    broadcast,
  }))();
