import { litActionHandler } from '../../litActionHandler';
import { batchGenerateEncryptedKeys } from '../../raw-action-functions/common/batchGenerateEncryptedKeys';

/* global actions accessControlConditions */

declare global {
  var actions: any[];
  var accessControlConditions: string
}

(async () =>
  litActionHandler(async () =>
    batchGenerateEncryptedKeys({ actions, accessControlConditions })
  ))();
