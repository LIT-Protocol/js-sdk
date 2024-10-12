/* global accessControlConditions, ciphertext, dataToEncryptHash */

import { litActionHandler } from '../../litActionHandler';
import { exportPrivateKey } from '../../raw-action-functions/common/exportPrivateKey';

(async () =>
  litActionHandler(async () =>
    exportPrivateKey({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
    })
  ))();
