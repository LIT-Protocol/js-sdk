import { litActionHandler } from '../../litActionHandler';
import { signMessageWithEncryptedEthereumKey } from '../../raw-action-functions/ethereum/signMessageWithEncryptedEthereumKey';

import type { SignMessageWithEncryptedEthereumKeyParams } from '../../raw-action-functions/ethereum/signMessageWithEncryptedEthereumKey';

// Using local declarations to avoid _every file_ thinking these are always in scope
declare const accessControlConditions: SignMessageWithEncryptedEthereumKeyParams['accessControlConditions'];
declare const ciphertext: SignMessageWithEncryptedEthereumKeyParams['ciphertext'];
declare const dataToEncryptHash: SignMessageWithEncryptedEthereumKeyParams['dataToEncryptHash'];
declare const messageToSign: SignMessageWithEncryptedEthereumKeyParams['messageToSign'];

(async () =>
  litActionHandler(async () =>
    signMessageWithEncryptedEthereumKey({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      messageToSign,
    })
  ))();
