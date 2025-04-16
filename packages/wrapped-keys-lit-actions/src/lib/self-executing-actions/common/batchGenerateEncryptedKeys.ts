import { litActionHandler } from '../../litActionHandler';
import { batchGenerateEncryptedKeys } from '../../raw-action-functions/common/batchGenerateEncryptedKeys';

import type { BatchGenerateEncryptedKeysParams } from '../../raw-action-functions/common/batchGenerateEncryptedKeys';

// Using local declarations to avoid _every file_ thinking these are always in scope
declare const actions: BatchGenerateEncryptedKeysParams['actions'];
declare const accessControlConditions: BatchGenerateEncryptedKeysParams['accessControlConditions'];

(async () =>
  litActionHandler(async () =>
    batchGenerateEncryptedKeys({ actions, accessControlConditions })
  ))();
