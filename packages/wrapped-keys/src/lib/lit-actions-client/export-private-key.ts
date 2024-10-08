import { GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK } from '@lit-protocol/constants';
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
    litNodeClient,
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
  const result = await litNodeClient.executeJs({
    sessionSigs: pkpSessionSigs,
    code: litActionCode,
    ipfsId: litActionIpfsCid,
    jsParams: {
      pkpAddress,
      ciphertext,
      dataToEncryptHash,
      accessControlConditions,
    },
    ipfsOptions: {
      overwriteCode:
        GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK[litNodeClient.config.litNetwork],
    },
  });

  const decryptedPrivateKey = postLitActionValidation(result);

  return {
    decryptedPrivateKey,
    pkpAddress,
    ...storeKeyMetadataMinusEncryptedAndPkp,
  };
}
