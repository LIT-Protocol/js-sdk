import { GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK } from '@lit-protocol/constants';
import { AccessControlConditions } from '@lit-protocol/types';

import { postLitActionValidation } from './utils';
import { BatchGeneratePrivateKeysParams, Network } from '../types';

interface BatchGeneratePrivateKeysWithLitActionParams
  extends BatchGeneratePrivateKeysParams {
  accessControlConditions: AccessControlConditions;
  litActionIpfsCid?: string;
  litActionCode?: string;
}

interface GeneratePrivateKeyLitActionResult {
  ciphertext: string;
  dataToEncryptHash: string;
  publicKey: string;
  memo: string;
}

interface BatchGeneratePrivateKeysWithLitActionResult {
  network: Network;
  signedMessage?: { signature: string };
  generatedPrivateKey: GeneratePrivateKeyLitActionResult;
}

export async function batchGenerateKeysWithLitAction(
  args: BatchGeneratePrivateKeysWithLitActionParams
): Promise<BatchGeneratePrivateKeysWithLitActionResult[]> {
  const {
    accessControlConditions,
    litNodeClient,
    actions,
    pkpSessionSigs,
    litActionIpfsCid,
    litActionCode,
  } = args;

  const result = await litNodeClient.executeJs({
    sessionSigs: pkpSessionSigs,
    ipfsId: litActionIpfsCid,
    code: litActionCode,
    jsParams: {
      actions,
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
