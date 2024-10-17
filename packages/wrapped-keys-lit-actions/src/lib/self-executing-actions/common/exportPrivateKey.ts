/* global accessControlConditions, ciphertext, dataToEncryptHash */

import { litActionHandler } from '../../litActionHandler';
import { exportPrivateKey } from '../../raw-action-functions/common/exportPrivateKey';

declare global {
  var accessControlConditions: any;
  var ciphertext: any;
  var dataToEncryptHash: any;
}

(async () =>
  litActionHandler(async () =>
    exportPrivateKey({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
    })
  ))();
