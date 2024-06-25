import {
  AccessControlConditions,
  ILitNodeClient,
  SessionSigsMap,
} from '@lit-protocol/types';

import { postLitActionValidation } from './utils';
import { StoredKeyMetadata } from '../service-client';
import { Network } from '../types';

interface SignMessageWithLitActionParams {
  pkpSessionSigs: SessionSigsMap;
  litNodeClient: ILitNodeClient;
  accessControlConditions: AccessControlConditions;
  storedKeyMetadata: StoredKeyMetadata;
  network: Network;
  litActionIpfsCid?: string;
  litActionCode?: string;
  params?: Record<string, unknown>;
  messageToSign: string | Uint8Array;
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
    litActionCode,
    storedKeyMetadata,
    params,
  } = args;

  try {
    const { pkpAddress, ciphertext, dataToEncryptHash } = storedKeyMetadata;
    const result = await litNodeClient.executeJs({
      sessionSigs: pkpSessionSigs,
      ipfsId: litActionIpfsCid,
      code: litActionCode,
      jsParams: {
        pkpAddress,
        ciphertext,
        dataToEncryptHash,
        messageToSign,
        accessControlConditions,
        ...params,
      },
    });
    return postLitActionValidation(result);
  } catch (err: any) {
    throw new Error(
      `Lit Action threw an unexpected error: ${JSON.stringify(err)}`
    );
  }
}
