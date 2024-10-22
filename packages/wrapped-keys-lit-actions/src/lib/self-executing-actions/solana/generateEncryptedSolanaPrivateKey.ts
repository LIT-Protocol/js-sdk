import { litActionHandler } from '../../litActionHandler';
import { generateEncryptedSolanaPrivateKey } from '../../raw-action-functions/solana/generateEncryptedSolanaPrivateKey';

import type { GenerateEncryptedSolanaPrivateKeyParams } from '../../raw-action-functions/solana/generateEncryptedSolanaPrivateKey';

// Using local declarations to avoid _every file_ thinking these are always in scope
declare const accessControlConditions: GenerateEncryptedSolanaPrivateKeyParams['accessControlConditions'];

(async () =>
  litActionHandler(async () =>
    generateEncryptedSolanaPrivateKey({
      accessControlConditions,
    })
  ))();
