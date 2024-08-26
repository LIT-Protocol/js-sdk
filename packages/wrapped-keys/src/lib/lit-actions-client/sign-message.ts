import { AccessControlConditions } from '@lit-protocol/types';

import { postLitActionValidation } from './utils';
import { SignMessageWithEncryptedKeyParams, StoredKeyData } from '../types';
import { GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK } from '@lit-protocol/constants';

interface SignMessageWithLitActionParams
  extends SignMessageWithEncryptedKeyParams {
  accessControlConditions: AccessControlConditions;
  storedKeyMetadata: StoredKeyData;
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
    ipfsOptions: {
      overwriteCode:
        GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK[litNodeClient.config.litNetwork],
    },
  });
  return postLitActionValidation(result);
}
