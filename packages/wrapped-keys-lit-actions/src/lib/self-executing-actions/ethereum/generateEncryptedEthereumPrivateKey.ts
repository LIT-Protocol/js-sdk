import { litActionHandler } from '../../litActionHandler';
import { generateEncryptedEthereumPrivateKey } from '../../raw-action-functions/ethereum/generateEncryptedEthereumPrivateKey';

import type { GenerateEncryptedEthereumPrivateKeyParams } from '../../raw-action-functions/ethereum/generateEncryptedEthereumPrivateKey';

declare const jsParams: GenerateEncryptedEthereumPrivateKeyParams;

(async () =>
  litActionHandler(async () =>
    generateEncryptedEthereumPrivateKey(jsParams)
  ))();
