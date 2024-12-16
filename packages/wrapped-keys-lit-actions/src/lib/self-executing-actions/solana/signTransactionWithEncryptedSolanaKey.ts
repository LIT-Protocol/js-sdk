import { litActionHandler } from '../../litActionHandler';
import { signTransactionWithEncryptedSolanaKey } from '../../raw-action-functions/solana/signTransactionWithEncryptedSolanaKey';

import type { SignTransactionWithEncryptedSolanaKeyParams } from '../../raw-action-functions/solana/signTransactionWithEncryptedSolanaKey';

// Using local declarations to avoid _every file_ thinking these are always in scope
// Ugly, but using `declare global` causes conflicts with `ethereum`'s `unsignedTransaction` which is different
// as well as making all of our functions think all other functions args are valid globals in every file in the package
declare const accessControlConditions: SignTransactionWithEncryptedSolanaKeyParams['accessControlConditions'];
declare const ciphertext: SignTransactionWithEncryptedSolanaKeyParams['ciphertext'];
declare const dataToEncryptHash: SignTransactionWithEncryptedSolanaKeyParams['dataToEncryptHash'];
declare const unsignedTransaction: SignTransactionWithEncryptedSolanaKeyParams['unsignedTransaction'];
declare const broadcast: SignTransactionWithEncryptedSolanaKeyParams['broadcast'];

(async () =>
  litActionHandler(async () =>
    signTransactionWithEncryptedSolanaKey({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      unsignedTransaction,
      broadcast,
    })
  ))();
