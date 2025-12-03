import { litActionHandler } from '../../litActionHandler';
import {
  SignTypedDataWithEncryptedEthereumKeyParams,
  signTypedDataWithEncryptedEthereumKey,
} from '../../raw-action-functions/ethereum/signTypedDataWithEncryptedEthereumKey';

import type { SignMessageWithEncryptedEthereumKeyParams } from '../../raw-action-functions/ethereum/signMessageWithEncryptedEthereumKey';

// Using local declarations to avoid _every file_ thinking these are always in scope
declare const accessControlConditions: SignMessageWithEncryptedEthereumKeyParams['accessControlConditions'];
declare const ciphertext: SignMessageWithEncryptedEthereumKeyParams['ciphertext'];
declare const dataToEncryptHash: SignMessageWithEncryptedEthereumKeyParams['dataToEncryptHash'];
declare const messageToSign: SignTypedDataWithEncryptedEthereumKeyParams['messageToSign'];

(async () =>
  litActionHandler(async () =>
    signTypedDataWithEncryptedEthereumKey({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      messageToSign,
    })
  ))();
