/* global accessControlConditions, ciphertext, dataToEncryptHash */

import { exportPrivateKey } from '../../raw-action-functions/common/exportPrivateKey';

(async () =>
  exportPrivateKey({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
  }))();
