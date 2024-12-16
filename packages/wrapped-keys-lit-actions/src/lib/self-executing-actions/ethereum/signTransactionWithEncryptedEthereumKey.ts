import { litActionHandler } from '../../litActionHandler';
import { signTransactionWithEncryptedEthereumKey } from '../../raw-action-functions/ethereum/signTransactionWithEncryptedEthereumKey';

import type { SignTransactionWithEncryptedEthereumKeyParams } from '../../raw-action-functions/ethereum/signTransactionWithEncryptedEthereumKey';

// Using local declarations to avoid _every file_ thinking these are always in scope
// Ugly, but using `declare global` causes conflicts with `solana`'s `unsignedTransaction` which is different
// as well as making all of our functions think all other functions args are valid globals in every file in the package
declare const accessControlConditions: SignTransactionWithEncryptedEthereumKeyParams['accessControlConditions'];
declare const ciphertext: SignTransactionWithEncryptedEthereumKeyParams['ciphertext'];
declare const dataToEncryptHash: SignTransactionWithEncryptedEthereumKeyParams['dataToEncryptHash'];
declare const unsignedTransaction: SignTransactionWithEncryptedEthereumKeyParams['unsignedTransaction'];
declare const broadcast: SignTransactionWithEncryptedEthereumKeyParams['broadcast'];

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
