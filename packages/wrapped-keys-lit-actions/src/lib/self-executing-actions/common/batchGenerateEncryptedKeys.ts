import { litActionHandler } from '../../litActionHandler';
import { batchGenerateEncryptedKeys } from '../../raw-action-functions/common/batchGenerateEncryptedKeys';

/* global actions accessControlConditions */

declare global {
  var actions: any[];
  var accessControlConditions: any;
}

(async () =>
  litActionHandler(async () =>
    batchGenerateEncryptedKeys({ actions, accessControlConditions })
  ))();
