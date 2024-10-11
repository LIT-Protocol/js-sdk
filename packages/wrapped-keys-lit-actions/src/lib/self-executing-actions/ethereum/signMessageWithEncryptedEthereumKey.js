/* global accessControlConditions, ciphertext, dataToEncryptHash, messageToSign */

import { signMessageWithEncryptedEthereumKey } from '../../raw-action-functions/ethereum/signMessageWithEncryptedEthereumKey';

(async () =>
  signMessageWithEncryptedEthereumKey({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
    messageToSign,
  }))();
