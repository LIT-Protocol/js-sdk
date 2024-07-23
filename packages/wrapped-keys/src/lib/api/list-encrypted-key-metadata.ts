import { listPrivateKeyMetadata } from '../service-client';
import { ListEncryptedKeyMetadataParams, StoredKeyMetadata } from '../types';
import { getFirstSessionSig } from '../utils';

/** Get list of metadata for previously encrypted and persisted private keys
 * Note that this method does include the `ciphertext` or `dataToEncryptHash` values necessary to decrypt the keys.
 * To get those values, call `getEncryptedKeyMetadata()` with the `id` for the appropriate key returned by this method.
 *
 * @param { ListEncryptedKeyMetadataParams } params Parameters required to fetch the encrypted private key metadata
 * @returns { Promise<StoredKeyMetadata> } The encrypted private key and its associated metadata
 */
export async function listEncryptedKeyMetadata(
  params: ListEncryptedKeyMetadataParams
): Promise<StoredKeyMetadata[]> {
  const { pkpSessionSigs, litNodeClient } = params;

  return listPrivateKeyMetadata({
    sessionSig: getFirstSessionSig(pkpSessionSigs),
    litNetwork: litNodeClient.config.litNetwork,
  });
}
