import { litActionHandler } from '../../litActionHandler';
import { signTransactionWithEncryptedSolanaKey } from '../../raw-action-functions/solana/signTransactionWithEncryptedSolanaKey';

import type { SignTransactionWithEncryptedSolanaKeyParams } from '../../raw-action-functions/solana/signTransactionWithEncryptedSolanaKey';

declare const jsParams: SignTransactionWithEncryptedSolanaKeyParams;

(async () =>
  litActionHandler(async () =>
    signTransactionWithEncryptedSolanaKey(jsParams)
  ))();
