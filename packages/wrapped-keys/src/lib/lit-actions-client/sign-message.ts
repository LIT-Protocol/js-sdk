import { AccessControlConditions } from '@lit-protocol/types';

import { postLitActionValidation } from './utils';
import { SignMessageWithEncryptedKeyParams, StoredKeyMetadata } from '../types';

interface SignMessageWithLitActionParams
  extends SignMessageWithEncryptedKeyParams {
  accessControlConditions: AccessControlConditions;
  storedKeyMetadata: StoredKeyMetadata;
  litActionIpfsCid: string;
}

export async function signMessageWithLitAction(
  args: SignMessageWithLitActionParams
) {
  const {
    accessControlConditions,
    litNodeClient,
    messageToSign,
    pkpSessionSigs,
    litActionIpfsCid,
    storedKeyMetadata,
  } = args;

  try {
    const { pkpAddress, ciphertext, dataToEncryptHash } = storedKeyMetadata;
    const result = await litNodeClient.executeJs({
      sessionSigs: pkpSessionSigs,
      ipfsId: litActionIpfsCid,
      jsParams: {
        pkpAddress,
        ciphertext,
        dataToEncryptHash,
        messageToSign,
        accessControlConditions,
      },
    });
    return postLitActionValidation(result);
  } catch (err: any) {
    throw new Error(
      `Lit Action threw an unexpected error: ${JSON.stringify(err)}`
    );
  }
}
