/* global accessControlConditions */

import { litActionHandler } from '../../litActionHandler';
import { generateEncryptedEthereumPrivateKey } from '../../raw-action-functions/ethereum/generateEncryptedEthereumPrivateKey';

(async () =>
  litActionHandler(async () =>
    generateEncryptedEthereumPrivateKey({
      accessControlConditions,
    })
  ))();
