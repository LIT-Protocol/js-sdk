import {
  getFirstSessionSig,
  getPkpAddressFromSessionSig,
  getLitNetworkFromClient,
} from './utils';
import { storePrivateKeyBatch } from '../service-client';
import { StoreKeyBatchParams } from '../service-client/types';
import {
  StoredKeyData,
  StoreEncryptedKeyBatchParams,
  StoreEncryptedKeyBatchResult,
} from '../types';

/** Stores a batch of encrypted private keys and their metadata to the wrapped keys backend service
 *
 * @param { StoreEncryptedKeyParams } params Parameters required to fetch the encrypted private key metadata
 * @returns { Promise<StoreEncryptedKeyResult> } The encrypted private key and its associated metadata
 */
export async function storeEncryptedKeyBatch(
  params: StoreEncryptedKeyBatchParams
): Promise<StoreEncryptedKeyBatchResult> {
  const { pkpSessionSigs, litClient, keyBatch } = params;
  const sessionSig = getFirstSessionSig(pkpSessionSigs);
  const pkpAddress = getPkpAddressFromSessionSig(sessionSig);
  const litNetwork = getLitNetworkFromClient(litClient);

  const storedKeyMetadataBatch: StoreKeyBatchParams['storedKeyMetadataBatch'] =
    keyBatch.map(
      ({
        keyType,
        publicKey,
        memo,
        dataToEncryptHash,
        ciphertext,
      }): Pick<
        StoredKeyData,
        | 'pkpAddress'
        | 'publicKey'
        | 'keyType'
        | 'dataToEncryptHash'
        | 'ciphertext'
        | 'memo'
      > => ({
        pkpAddress,
        publicKey,
        memo,
        dataToEncryptHash,
        ciphertext,
        keyType,
      })
    );

  return storePrivateKeyBatch({
    storedKeyMetadataBatch,
    sessionSig,
    litNetwork,
  });
}
