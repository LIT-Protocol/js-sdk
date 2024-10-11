/* global accessControlConditions */

import { generateEncryptedEthereumPrivateKey } from '../../raw-action-functions/ethereum/generateEncryptedEthereumPrivateKey';

(async () =>
  generateEncryptedEthereumPrivateKey({
    accessControlConditions,
  }))();
