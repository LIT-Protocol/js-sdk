import { litActionHandler } from '../../litActionHandler';
import { signMessageWithEncryptedEthereumKey } from '../../raw-action-functions/ethereum/signMessageWithEncryptedEthereumKey';

import type { SignMessageWithEncryptedEthereumKeyParams } from '../../raw-action-functions/ethereum/signMessageWithEncryptedEthereumKey';

declare const jsParams: SignMessageWithEncryptedEthereumKeyParams;

(async () =>
  litActionHandler(async () =>
    signMessageWithEncryptedEthereumKey({
      accessControlConditions: jsParams.accessControlConditions,
      ciphertext: jsParams.ciphertext,
      dataToEncryptHash: jsParams.dataToEncryptHash,
      messageToSign: jsParams.messageToSign,
    })
  ))();
