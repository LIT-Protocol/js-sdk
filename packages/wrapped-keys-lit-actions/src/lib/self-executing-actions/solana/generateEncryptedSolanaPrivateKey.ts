import { litActionHandler } from '../../litActionHandler';
import { generateEncryptedSolanaPrivateKey } from '../../raw-action-functions/solana/generateEncryptedSolanaPrivateKey';

import type { GenerateEncryptedSolanaPrivateKeyParams } from '../../raw-action-functions/solana/generateEncryptedSolanaPrivateKey';

declare const jsParams: GenerateEncryptedSolanaPrivateKeyParams;

(async () =>
  litActionHandler(async () => generateEncryptedSolanaPrivateKey(jsParams)))();
