import { storePrivateKeyMetadata } from '../service-client';
import { StoreEncryptedKeyMetadataParams } from '../types';
import { getFirstSessionSig, getPkpAddressFromSessionSig } from '../utils';

/** Get a previously encrypted and persisted private key and its metadata.
 * Note that this method does _not_ decrypt the private key; only the _encrypted_ key and its metadata will be returned to the caller.
 *
 * @param { StoreEncryptedKeyMetadataParams } params Parameters required to fetch the encrypted private key metadata
 * @returns { Promise<StoredKeyMetadata> } The encrypted private key and its associated metadata
 */
export async function storeEncryptedKeyMetadata(
  params: StoreEncryptedKeyMetadataParams
): Promise<boolean> {
  const { pkpSessionSigs, litNodeClient } = params;
  const sessionSig = getFirstSessionSig(pkpSessionSigs);
  const pkpAddress = getPkpAddressFromSessionSig(sessionSig);

  const { address, keyType, dataToEncryptHash, ciphertext } = params;

  return storePrivateKeyMetadata({
    storedKeyMetadata: {
      address,
      keyType,
      dataToEncryptHash,
      ciphertext,
      pkpAddress,
    },
    sessionSig: getFirstSessionSig(pkpSessionSigs),
    litNodeClient,
  });
}
