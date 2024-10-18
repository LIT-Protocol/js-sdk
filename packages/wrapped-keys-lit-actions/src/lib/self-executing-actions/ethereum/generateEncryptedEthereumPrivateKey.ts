/* global accessControlConditions */

import { litActionHandler } from '../../litActionHandler';
import { generateEncryptedEthereumPrivateKey } from '../../raw-action-functions/ethereum/generateEncryptedEthereumPrivateKey';

declare global {
  var accessControlConditions: string;
}

(async () =>
  litActionHandler(async () =>
    generateEncryptedEthereumPrivateKey({
      accessControlConditions,
    })
  ))();
