import { GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK } from '@lit-protocol/constants';
import {
  AccessControlConditions,
  ILitNodeClient,
  SessionSigsMap,
} from '@lit-protocol/types';

import { postLitActionValidation } from './utils';
import {
  EthereumLitTransaction,
  SerializedTransaction,
  StoredKeyData,
} from '../types';

interface SignTransactionWithLitActionParams {
  litNodeClient: ILitNodeClient;
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
  litNodeClient,
  pkpSessionSigs,
  storedKeyMetadata: { ciphertext, dataToEncryptHash, pkpAddress },
  unsignedTransaction,
  versionedTransaction,
}: SignTransactionWithLitActionParams): Promise<string> {
  const result = await litNodeClient.executeJs({
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
    },
    ipfsOptions: {
      overwriteCode:
        GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK[litNodeClient.config.litNetwork],
    },
  });

  return postLitActionValidation(result);
}
