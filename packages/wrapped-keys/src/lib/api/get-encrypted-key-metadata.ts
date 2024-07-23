import { fetchPrivateKeyMetadata } from '../service-client';
import { GetEncryptedKeyMetadataParams, StoredKeyData } from '../types';
import { getFirstSessionSig } from '../utils';

/** Get a previously encrypted and persisted private key and its metadata.
 * Note that this method does _not_ decrypt the private key; only the _encrypted_ key and its metadata will be returned to the caller.
 *
 * @param { GetEncryptedKeyMetadataParams } params Parameters required to fetch the encrypted private key metadata
 * @returns { Promise<StoredKeyMetadata> } The encrypted private key and its associated metadata
 */
export async function getEncryptedKeyMetadata(
  params: GetEncryptedKeyMetadataParams
): Promise<StoredKeyData> {
  const { pkpSessionSigs, litNodeClient, id } = params;

  return fetchPrivateKeyMetadata({
    id,
    sessionSig: getFirstSessionSig(pkpSessionSigs),
    litNetwork: litNodeClient.config.litNetwork,
  });
}
