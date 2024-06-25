import {
  AccessControlConditions,
  ILitNodeClient,
  SessionSigsMap,
} from '@lit-protocol/types';

import { postLitActionValidation } from './utils';
import { StoredKeyMetadata } from '../service-client';
import { EthereumLitTransaction, SerializedTransaction } from '../types';

interface SignTransactionWithLitActionParams {
  litNodeClient: ILitNodeClient;
  pkpSessionSigs: SessionSigsMap;
  litActionIpfsCid?: string;
  litActionCode?: string;
  unsignedTransaction: EthereumLitTransaction | SerializedTransaction;
  storedKeyMetadata: StoredKeyMetadata;
  accessControlConditions: AccessControlConditions;
  broadcast: boolean;
  params?: Record<string, unknown>;
}

export async function signTransactionWithLitAction(
  args: SignTransactionWithLitActionParams
): Promise<string> {
  const {
    storedKeyMetadata,
    pkpSessionSigs,
    litNodeClient,
    unsignedTransaction,
    broadcast,
    accessControlConditions,
    litActionCode,
    litActionIpfsCid,
    params,
  } = args;

  const { ciphertext, dataToEncryptHash, pkpAddress } = storedKeyMetadata;
  try {
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
