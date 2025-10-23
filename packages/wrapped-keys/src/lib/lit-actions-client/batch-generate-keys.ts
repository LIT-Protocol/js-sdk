import { AccessControlConditions } from '@lit-protocol/types';

import { postLitActionValidation } from './utils';
import { BatchGeneratePrivateKeysParams, Network } from '../types';

interface BatchGeneratePrivateKeysWithLitActionParams
  extends BatchGeneratePrivateKeysParams {
  accessControlConditions: AccessControlConditions;
  litActionIpfsCid?: string;
  litActionCode?: string;
  userMaxPrice?: bigint;
}

interface GeneratePrivateKeyLitActionResult {
  ciphertext: string;
  dataToEncryptHash: string;
  publicKey: string;
  memo: string;
}

interface BatchGeneratePrivateKeysWithLitActionResult {
  network: Network;
  signMessage?: { signature: string };
  generateEncryptedPrivateKey: GeneratePrivateKeyLitActionResult;
}

export async function batchGenerateKeysWithLitAction(
  args: BatchGeneratePrivateKeysWithLitActionParams
): Promise<BatchGeneratePrivateKeysWithLitActionResult[]> {
  const {
    accessControlConditions,
    litClient,
    actions,
    pkpSessionSigs,
    litActionIpfsCid,
    litActionCode,
    userMaxPrice,
  } = args;

  const result = await litClient.executeJs({
    useSingleNode: true,
    sessionSigs: pkpSessionSigs,
    ipfsId: litActionIpfsCid,
    code: litActionCode,
    userMaxPrice,
    jsParams: {
      actions,
      accessControlConditions,
    },
  });

  const response = postLitActionValidation(result);
  return JSON.parse(response);
}
