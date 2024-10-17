import { litActionHandler } from '../../litActionHandler';
import { batchGenerateEncryptedKeys } from '../../raw-action-functions/common/batchGenerateEncryptedKeys';

/* global actions accessControlConditions */

(async () =>
  litActionHandler(async () =>
    batchGenerateEncryptedKeys({ actions, accessControlConditions })
  ))();
