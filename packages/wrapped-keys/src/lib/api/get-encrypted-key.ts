import { getFirstSessionSig, getPkpAddressFromSessionSig } from './utils';
import { fetchPrivateKey } from '../service-client';
import { GetEncryptedKeyDataParams, StoredKeyData } from '../types';

/** Get a previously encrypted and persisted private key and its metadata.
 * Note that this method does _not_ decrypt the private key; only the _encrypted_ key and its metadata will be returned to the caller.
 *
 * @param { GetEncryptedKeyDataParams } params Parameters required to fetch the encrypted private key metadata
 * @returns { Promise<StoredKeyData> } The encrypted private key and its associated metadata
 */
export async function getEncryptedKey(
  params: GetEncryptedKeyDataParams
): Promise<StoredKeyData> {
  const { pkpSessionSigs, litNodeClient, id, includeVersions } = params;

  const sessionSig = getFirstSessionSig(pkpSessionSigs);
  const pkpAddress = getPkpAddressFromSessionSig(sessionSig);

  return fetchPrivateKey({
    pkpAddress,
    id,
    sessionSig,
    litNetwork: litNodeClient.config.litNetwork,
    includeVersions,
  });
}
