/* global accessControlConditions */

import { litActionHandler } from '../../litActionHandler';
import { generateEncryptedEthereumPrivateKey } from '../../raw-action-functions/ethereum/generateEncryptedEthereumPrivateKey';

declare global {
  var accessControlConditions: any;
}

(async () =>
  litActionHandler(async () =>
    generateEncryptedEthereumPrivateKey({
      accessControlConditions,
    })
  ))();
