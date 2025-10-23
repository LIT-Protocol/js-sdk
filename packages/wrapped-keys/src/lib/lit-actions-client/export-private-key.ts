import { AccessControlConditions } from '@lit-protocol/types';

import { postLitActionValidation } from './utils';
import { ExportPrivateKeyParams, StoredKeyData } from '../types';

interface SignMessageWithLitActionParams extends ExportPrivateKeyParams {
  accessControlConditions: AccessControlConditions;
  storedKeyMetadata: StoredKeyData;
  litActionIpfsCid?: string;
  litActionCode?: string;
}

export async function exportPrivateKeyWithLitAction(
  args: SignMessageWithLitActionParams
) {
  const {
    accessControlConditions,
    litClient,
    pkpSessionSigs,
    litActionCode,
    litActionIpfsCid,
    storedKeyMetadata,
  } = args;

  const {
    pkpAddress,
    ciphertext,
    dataToEncryptHash,
    ...storeKeyMetadataMinusEncryptedAndPkp
  } = storedKeyMetadata;
  const result = await litClient.executeJs({
    sessionSigs: pkpSessionSigs,
    code: litActionCode,
    ipfsId: litActionIpfsCid,
    jsParams: {
      pkpAddress,
      ciphertext,
      dataToEncryptHash,
      accessControlConditions,
    },
  });

  const decryptedPrivateKey = postLitActionValidation(result);

  return {
    decryptedPrivateKey,
    pkpAddress,
    ...storeKeyMetadataMinusEncryptedAndPkp,
  };
}
