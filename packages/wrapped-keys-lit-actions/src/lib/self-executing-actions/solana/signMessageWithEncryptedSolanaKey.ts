import { litActionHandler } from '../../litActionHandler';
import { signMessageWithEncryptedSolanaKey } from '../../raw-action-functions/solana/signMessageWithEncryptedSolanaKey';

import type { SignMessageWithEncryptedSolanaKeyParams } from '../../raw-action-functions/solana/signMessageWithEncryptedSolanaKey';

// Using local declarations to avoid _every file_ thinking these are always in scope
declare const accessControlConditions: SignMessageWithEncryptedSolanaKeyParams['accessControlConditions'];
declare const ciphertext: SignMessageWithEncryptedSolanaKeyParams['ciphertext'];
declare const dataToEncryptHash: SignMessageWithEncryptedSolanaKeyParams['dataToEncryptHash'];
declare const messageToSign: SignMessageWithEncryptedSolanaKeyParams['messageToSign'];

(async () =>
  litActionHandler(async () =>
    signMessageWithEncryptedSolanaKey({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      messageToSign,
    })
  ))();
