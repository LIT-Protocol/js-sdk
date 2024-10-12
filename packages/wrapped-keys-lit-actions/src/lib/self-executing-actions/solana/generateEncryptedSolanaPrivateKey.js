/* global accessControlConditions */

import { litActionHandler } from '../../litActionHandler';
import { generateEncryptedSolanaPrivateKey } from '../../raw-action-functions/solana/generateEncryptedSolanaPrivateKey';

(async () =>
  litActionHandler(async () =>
    generateEncryptedSolanaPrivateKey({
      accessControlConditions,
    })
  ))();
