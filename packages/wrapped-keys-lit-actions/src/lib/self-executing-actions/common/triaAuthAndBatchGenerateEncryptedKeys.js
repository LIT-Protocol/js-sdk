import { litActionHandler } from '../../litActionHandler';
import { triaAuthAndBatchGenerateEncryptedKeys } from '../../raw-action-functions/common/triaAuthAndBatchGenerateEncryptedKeys';

/* global actions accessControlConditions triaParams*/
(async () =>
  litActionHandler(async () =>
    triaAuthAndBatchGenerateEncryptedKeys({
      actions,
      accessControlConditions,
      triaParams,
    })
  ))();
