import { AccessControlConditions, SessionSigsMap } from '@lit-protocol/types';

import { postLitActionValidation } from './utils';
import {
  EthereumLitTransaction,
  SerializedTransaction,
  StoredKeyData,
} from '../types';
import type { LitClient } from '../types';

interface SignTransactionWithLitActionParams {
  litClient: LitClient;
  pkpSessionSigs: SessionSigsMap;
  litActionIpfsCid?: string;
  litActionCode?: string;
  unsignedTransaction: EthereumLitTransaction | SerializedTransaction;
  storedKeyMetadata: StoredKeyData;
  accessControlConditions: AccessControlConditions;
  broadcast: boolean;
  versionedTransaction?: boolean;
}

export async function signTransactionWithLitAction({
  accessControlConditions,
  broadcast,
  litActionIpfsCid,
  litActionCode,
  litClient,
  pkpSessionSigs,
  storedKeyMetadata: { ciphertext, dataToEncryptHash, pkpAddress },
  unsignedTransaction,
  versionedTransaction,
}: SignTransactionWithLitActionParams): Promise<string> {
  const result = await litClient.executeJs({
    sessionSigs: pkpSessionSigs,
    ipfsId: litActionIpfsCid,
    code: litActionCode,
    jsParams: {
      pkpAddress,
      ciphertext,
      dataToEncryptHash,
      unsignedTransaction,
      broadcast,
      accessControlConditions,
      versionedTransaction,
      jsParams: {
        pkpAddress,
        ciphertext,
        dataToEncryptHash,
        unsignedTransaction,
        broadcast,
        accessControlConditions,
        versionedTransaction,
      },
    },
  });

  return postLitActionValidation(result);
}
