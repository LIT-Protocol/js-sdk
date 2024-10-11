import { batchGenerateEncryptedKeys } from '../../raw-action-functions/common/batchGenerateEncryptedKeys';

/* global actions accessControlConditions */
(async () =>
  batchGenerateEncryptedKeys({ actions, accessControlConditions }))();
