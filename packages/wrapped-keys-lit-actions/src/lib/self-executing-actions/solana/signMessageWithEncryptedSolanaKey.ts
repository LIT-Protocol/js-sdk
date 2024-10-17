/* global accessControlConditions, ciphertext, dataToEncryptHash, messageToSign */

import { litActionHandler } from '../../litActionHandler';
import { signMessageWithEncryptedSolanaKey } from '../../raw-action-functions/solana/signMessageWithEncryptedSolanaKey';

declare global {
  var accessControlConditions: any;
  var ciphertext: any;
  var dataToEncryptHash: any;
  var messageToSign: any;
}

(async () =>
  litActionHandler(async () =>
    signMessageWithEncryptedSolanaKey({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      messageToSign,
    })
  ))();
