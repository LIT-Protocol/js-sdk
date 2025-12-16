import { litActionHandler } from '../../litActionHandler';
import { signMessageWithEncryptedSolanaKey } from '../../raw-action-functions/solana/signMessageWithEncryptedSolanaKey';

import type { SignMessageWithEncryptedSolanaKeyParams } from '../../raw-action-functions/solana/signMessageWithEncryptedSolanaKey';

declare const jsParams: SignMessageWithEncryptedSolanaKeyParams;

(async () =>
  litActionHandler(async () => signMessageWithEncryptedSolanaKey(jsParams)))();
