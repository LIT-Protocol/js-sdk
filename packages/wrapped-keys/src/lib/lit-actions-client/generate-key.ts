import {
  ConditionItem,
  ILitNodeClient,
  SessionSigsMap,
} from '@lit-protocol/types';

import { postLitActionValidation } from './utils';

interface GeneratePrivateKeyLitActionParams {
  pkpSessionSigs: SessionSigsMap;
  pkpAddress: string;
  litActionIpfsCid?: string;
  litActionCode?: string;
  accessControlConditions: ConditionItem[];
  litNodeClient: ILitNodeClient;
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
  if (!litActionIpfsCid && !litActionCode) {
    throw new Error(
      'Have to provide either the litActionIpfsCid or litActionCode'
    );
  }

  if (litActionIpfsCid && litActionCode) {
    throw new Error("Can't provide both a litActionIpfsCid or litActionCode");
  }

  try {
    const result = await litNodeClient.executeJs({
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
  } catch (err: any) {
    throw new Error(
      `Lit Action threw an unexpected error: ${JSON.stringify(err)}`
    );
  }
}
