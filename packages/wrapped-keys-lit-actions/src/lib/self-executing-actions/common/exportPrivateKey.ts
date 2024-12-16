import { litActionHandler } from '../../litActionHandler';
import { exportPrivateKey } from '../../raw-action-functions/common/exportPrivateKey';

import type { ExportPrivateKeyParams } from '../../raw-action-functions/common/exportPrivateKey';

// Using local declarations to avoid _every file_ thinking these are always in scope
declare const ciphertext: ExportPrivateKeyParams['ciphertext'];
declare const dataToEncryptHash: ExportPrivateKeyParams['dataToEncryptHash'];
declare const accessControlConditions: ExportPrivateKeyParams['accessControlConditions'];

(async () =>
  litActionHandler(async () =>
    exportPrivateKey({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
    })
  ))();
