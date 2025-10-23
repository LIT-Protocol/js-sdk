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
  litClient,
  pkpSessionSigs,
  litActionIpfsCid,
  litActionCode,
  accessControlConditions,
  pkpAddress,
}: GeneratePrivateKeyLitActionParams): Promise<GeneratePrivateKeyLitActionResult> {
  const result = await litClient.executeJs({
    useSingleNode: true,
    sessionSigs: pkpSessionSigs,
    ipfsId: litActionIpfsCid,
    code: litActionCode,
    jsParams: {
      pkpAddress,
      accessControlConditions,
      jsParams: {
        pkpAddress,
        accessControlConditions,
      },
    },
  });

  const response = postLitActionValidation(result);
  return JSON.parse(response);
}
