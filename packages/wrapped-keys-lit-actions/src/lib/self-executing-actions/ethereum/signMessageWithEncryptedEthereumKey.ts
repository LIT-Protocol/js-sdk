/* global accessControlConditions, ciphertext, dataToEncryptHash, messageToSign */

import { litActionHandler } from '../../litActionHandler';
import { signMessageWithEncryptedEthereumKey } from '../../raw-action-functions/ethereum/signMessageWithEncryptedEthereumKey';

declare global {
  var accessControlConditions: any;
  var ciphertext: any;
  var dataToEncryptHash: any;
  var messageToSign: any;
}

(async () =>
  litActionHandler(async () =>
    signMessageWithEncryptedEthereumKey({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      messageToSign,
    })
  ))();
