import { AccessControlConditions } from '@lit-protocol/types';

import { fetchAndUpdateCodeIfMatch, postLitActionValidation } from './utils';
import { GeneratePrivateKeyParams } from '../types';

interface GeneratePrivateKeyLitActionParams extends GeneratePrivateKeyParams {
  pkpAddress: string;
  accessControlConditions: AccessControlConditions;
  litActionIpfsCid: string;
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
  accessControlConditions,
  pkpAddress,
}: GeneratePrivateKeyLitActionParams): Promise<GeneratePrivateKeyLitActionResult> {
  const result = await litNodeClient.executeJs(
    await fetchAndUpdateCodeIfMatch({
      sessionSigs: pkpSessionSigs,
      ipfsId: litActionIpfsCid,
      jsParams: {
        pkpAddress,
        accessControlConditions,
      },
    })
  );

  const response = postLitActionValidation(result);
  return JSON.parse(response);
}
