import { litActionHandler } from '../../litActionHandler';
import { signTransactionWithEncryptedEthereumKey } from '../../raw-action-functions/ethereum/signTransactionWithEncryptedEthereumKey';

import type { SignTransactionWithEncryptedEthereumKeyParams } from '../../raw-action-functions/ethereum/signTransactionWithEncryptedEthereumKey';

declare const jsParams: SignTransactionWithEncryptedEthereumKeyParams;

(async () =>
  litActionHandler(async () =>
    signTransactionWithEncryptedEthereumKey(jsParams)
  ))();
