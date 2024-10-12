/* global accessControlConditions, ciphertext, dataToEncryptHash, messageToSign */

import { litActionHandler } from '../../litActionHandler';
import { signMessageWithEncryptedSolanaKey } from '../../raw-action-functions/solana/signMessageWithEncryptedSolanaKey';

(async () =>
  litActionHandler(async () =>
    signMessageWithEncryptedSolanaKey({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      messageToSign,
    })
  ))();
