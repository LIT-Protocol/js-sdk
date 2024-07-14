import { AccessControlConditions } from '@lit-protocol/types';

import { postLitActionValidation } from './utils';
import { ExportPrivateKeyParams, StoredKeyMetadata } from '../types';

interface SignMessageWithLitActionParams
  extends ExportPrivateKeyParams {
  accessControlConditions: AccessControlConditions;
  storedKeyMetadata: StoredKeyMetadata;
  litActionIpfsCid: string;
}

export async function exportPrivateKeyWithLitAction(
  args: SignMessageWithLitActionParams
) {
  const {
    accessControlConditions,
    litNodeClient,
    pkpSessionSigs,
    litActionIpfsCid,
    storedKeyMetadata,
  } = args;

  const { pkpAddress, ciphertext, dataToEncryptHash, ...storeKeyMetadataMinusEncryptedAndPkp } = storedKeyMetadata;
  const result = await litNodeClient.executeJs({
    sessionSigs: pkpSessionSigs,
    ipfsId: litActionIpfsCid,
    jsParams: {
      pkpAddress,
      ciphertext,
      dataToEncryptHash,
      accessControlConditions,
    },
  });

  const decryptedPrivateKey =  postLitActionValidation(result);

  return {
    decryptedPrivateKey,
    pkpAddress,
    ...storeKeyMetadataMinusEncryptedAndPkp,
  };
}
