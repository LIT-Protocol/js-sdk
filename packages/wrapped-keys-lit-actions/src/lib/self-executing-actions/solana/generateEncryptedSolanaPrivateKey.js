/* global accessControlConditions */

import { generateEncryptedSolanaPrivateKey } from '../../raw-action-functions/solana/generateEncryptedSolanaPrivateKey';

(async () =>
  generateEncryptedSolanaPrivateKey({
    accessControlConditions,
  }))();
