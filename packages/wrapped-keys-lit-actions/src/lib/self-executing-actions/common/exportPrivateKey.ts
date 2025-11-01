import { litActionHandler } from '../../litActionHandler';
import { exportPrivateKey } from '../../raw-action-functions/common/exportPrivateKey';

import type { ExportPrivateKeyParams } from '../../raw-action-functions/common/exportPrivateKey';

declare const jsParams: ExportPrivateKeyParams;

(async () => litActionHandler(async () => exportPrivateKey(jsParams)))();
