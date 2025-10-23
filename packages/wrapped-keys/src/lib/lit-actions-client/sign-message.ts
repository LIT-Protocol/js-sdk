import { AccessControlConditions } from '@lit-protocol/types';

import { postLitActionValidation } from './utils';
import { SignMessageWithEncryptedKeyParams, StoredKeyData } from '../types';

interface SignMessageWithLitActionParams
  extends SignMessageWithEncryptedKeyParams {
  accessControlConditions: AccessControlConditions;
  storedKeyMetadata: StoredKeyData;
  litActionIpfsCid?: string;
  litActionCode?: string;
}

export async function signMessageWithLitAction(
  args: SignMessageWithLitActionParams
) {
  const {
    accessControlConditions,
    litClient,
    messageToSign,
    pkpSessionSigs,
    litActionIpfsCid,
    litActionCode,
    storedKeyMetadata,
  } = args;

  const { pkpAddress, ciphertext, dataToEncryptHash } = storedKeyMetadata;
  const result = await litClient.executeJs({
    sessionSigs: pkpSessionSigs,
    ipfsId: litActionIpfsCid,
    code: litActionCode,
    jsParams: {
      pkpAddress,
      ciphertext,
      dataToEncryptHash,
      messageToSign,
      accessControlConditions,
    },
  });
  return postLitActionValidation(result);
}
