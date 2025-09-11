import { litActionHandler } from '../../litActionHandler';
import { decryptWrappedKeyForDelegatee } from '../../raw-action-functions/delegated/decryptWrappedKeyForDelegatee';

import type { DecryptWrappedKeyForDelegateeParams } from '../../raw-action-functions/delegated/decryptWrappedKeyForDelegatee';

// Using local declarations to avoid _every file_ thinking these are always in scope
declare const accessControlConditions: DecryptWrappedKeyForDelegateeParams['accessControlConditions'];
declare const ciphertext: DecryptWrappedKeyForDelegateeParams['ciphertext'];
declare const dataToEncryptHash: DecryptWrappedKeyForDelegateeParams['dataToEncryptHash'];
declare const agentWalletPkpEthAddress: DecryptWrappedKeyForDelegateeParams['agentWalletPkpEthAddress'];
declare const abilityIpfsCid: DecryptWrappedKeyForDelegateeParams['abilityIpfsCid'];

(async () =>
  litActionHandler(async () =>
    decryptWrappedKeyForDelegatee({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      agentWalletPkpEthAddress,
      abilityIpfsCid,
    })
  ))();
