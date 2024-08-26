import { AccessControlConditions } from '@lit-protocol/types';
import { postLitActionValidation } from './utils';
import { GeneratePrivateKeyParams } from '../types';
import { GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK } from '@lit-protocol/constants';

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
  const result = await litNodeClient.executeJs({
    sessionSigs: pkpSessionSigs,
    ipfsId: litActionIpfsCid,
    jsParams: {
      pkpAddress,
      accessControlConditions,
    },
    ipfsOptions: {
      overwriteCode:
        GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK[litNodeClient.config.litNetwork],
    },
  });

  const response = postLitActionValidation(result);
  return JSON.parse(response);
}
