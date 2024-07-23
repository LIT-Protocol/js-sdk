import { storePrivateKeyMetadata } from '../service-client';
import {
  StoreEncryptedKeyMetadataParams,
  StoreEncryptedKeyResult,
} from '../types';
import { getFirstSessionSig, getPkpAddressFromSessionSig } from '../utils';

/** Stores an encrypted private key and its metadata to the wrapped keys backend service
 *
 * @param { StoreEncryptedKeyMetadataParams } params Parameters required to fetch the encrypted private key metadata
 * @returns { Promise<StoredKeyMetadata> } The encrypted private key and its associated metadata
 */
export async function storeEncryptedKeyMetadata(
  params: StoreEncryptedKeyMetadataParams
): Promise<StoreEncryptedKeyResult> {
  const { pkpSessionSigs, litNodeClient } = params;
  const sessionSig = getFirstSessionSig(pkpSessionSigs);
  const pkpAddress = getPkpAddressFromSessionSig(sessionSig);

  const { publicKey, keyType, dataToEncryptHash, ciphertext, memo } = params;

  return storePrivateKeyMetadata({
    storedKeyMetadata: {
      publicKey,
      keyType,
      dataToEncryptHash,
      ciphertext,
      pkpAddress,
      memo,
    },
    sessionSig: getFirstSessionSig(pkpSessionSigs),
    litNetwork: litNodeClient.config.litNetwork,
  });
}
