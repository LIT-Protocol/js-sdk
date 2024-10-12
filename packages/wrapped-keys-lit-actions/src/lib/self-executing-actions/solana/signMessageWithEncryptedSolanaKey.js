/* global accessControlConditions, ciphertext, dataToEncryptHash, messageToSign */

import { signMessageWithEncryptedSolanaKey } from '../../raw-action-functions/solana/signMessageWithEncryptedSolanaKey';

(async () =>
  signMessageWithEncryptedSolanaKey({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
    messageToSign,
  }))();
