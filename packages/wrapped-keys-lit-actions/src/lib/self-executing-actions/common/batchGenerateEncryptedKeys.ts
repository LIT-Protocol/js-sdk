import { litActionHandler } from '../../litActionHandler';
import { batchGenerateEncryptedKeys } from '../../raw-action-functions/common/batchGenerateEncryptedKeys';

import type { BatchGenerateEncryptedKeysParams } from '../../raw-action-functions/common/batchGenerateEncryptedKeys';

declare const jsParams: BatchGenerateEncryptedKeysParams;

(async () =>
  litActionHandler(async () => batchGenerateEncryptedKeys(jsParams)))();
