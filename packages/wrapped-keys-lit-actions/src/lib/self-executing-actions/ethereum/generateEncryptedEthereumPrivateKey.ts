import { litActionHandler } from '../../litActionHandler';
import { generateEncryptedEthereumPrivateKey } from '../../raw-action-functions/ethereum/generateEncryptedEthereumPrivateKey';

import type { GenerateEncryptedEthereumPrivateKeyParams } from '../../raw-action-functions/ethereum/generateEncryptedEthereumPrivateKey';

// Using local declarations to avoid _every file_ thinking these are always in scope
declare const accessControlConditions: GenerateEncryptedEthereumPrivateKeyParams['accessControlConditions'];

(async () =>
  litActionHandler(async () =>
    generateEncryptedEthereumPrivateKey({
      accessControlConditions,
    })
  ))();
