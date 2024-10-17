/* global accessControlConditions, ciphertext, dataToEncryptHash, messageToSign */

import { litActionHandler } from '../../litActionHandler';
import { signMessageWithEncryptedEthereumKey } from '../../raw-action-functions/ethereum/signMessageWithEncryptedEthereumKey';

(async () =>
  litActionHandler(async () =>
    signMessageWithEncryptedEthereumKey({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      messageToSign,
    })
  ))();
