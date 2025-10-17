
import { AccessControlConditions } from '@lit-protocol/types';

import { postLitActionValidation } from './utils';
import { GeneratePrivateKeyParams } from '../types';

interface GeneratePrivateKeyLitActionParams extends GeneratePrivateKeyParams {
  pkpAddress: string;
  accessControlConditions: AccessControlConditions;
  litActionIpfsCid?: string;
  litActionCode?: string;
}

interface GeneratePrivateKeyLitActionResult {
  ciphertext: string;
  dataToEncryptHash: string;
  publicKey: string;
}

export async function generateKeyWithLitAction({
  litNodeClient,
  pkpSessionSigs,
  litActionIpfsCid,
  litActionCode,
  accessControlConditions,
  pkpAddress,
}: GeneratePrivateKeyLitActionParams): Promise<GeneratePrivateKeyLitActionResult> {
  const result = await litNodeClient.executeJs({
    useSingleNode: true,
    sessionSigs: pkpSessionSigs,
    ipfsId: litActionIpfsCid,
    code: litActionCode,
    jsParams: {
      pkpAddress,
      accessControlConditions,
    },

  });

  const response = postLitActionValidation(result);
  return JSON.parse(response);
}
