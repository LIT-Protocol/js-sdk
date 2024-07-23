import { FetchKeyParams, ListKeysParams, StoreKeyParams } from './types';
import { getBaseRequestParams, makeRequest } from './utils';
import {
  StoredKeyData,
  StoredKeyMetadata,
  StoreEncryptedKeyResult,
} from '../types';
import { getPkpAddressFromSessionSig } from '../utils';

/** Fetches previously stored private key metadata from the wrapped keys service.
 * Note that this list will not include `cipherText` or `dataToEncryptHash` necessary to decrypt the keys.
 * Use `fetchPrivateKeyMetadata()` to get those values.
 *
 * @param { FetchKeyParams } params Parameters required to fetch the private key metadata
 * @returns { Promise<StoredKeyMetadata> } The private key metadata object
 */
export async function listPrivateKeyMetadata(
  params: ListKeysParams
): Promise<StoredKeyMetadata[]> {
  const { litNetwork, sessionSig } = params;

  const { baseUrl, initParams } = getBaseRequestParams({
    litNetwork,
    sessionSig,
    method: 'GET',
  });

  const pkpAddress = getPkpAddressFromSessionSig(sessionSig);

  return makeRequest<StoredKeyMetadata[]>({
    url: `${baseUrl}/${pkpAddress}`,
    init: initParams,
  });
}

/** Fetches complete previously stored private key data from the wrapped keys service.
 * Includes the `ciphertext` and `dataToEncryptHash` necessarily to decrypt the key.
 *
 * @param { FetchKeyParams } params Parameters required to fetch the private key data
 * @returns { Promise<StoredKeyMetadata> } The private key metadata object
 */
export async function fetchPrivateKeyMetadata(
  params: FetchKeyParams
): Promise<StoredKeyData> {
  const { litNetwork, sessionSig, id } = params;

  const { baseUrl, initParams } = getBaseRequestParams({
    litNetwork,
    sessionSig,
    method: 'GET',
  });
  const pkpAddress = getPkpAddressFromSessionSig(sessionSig);

  return makeRequest<StoredKeyData>({
    url: `${baseUrl}/${pkpAddress}/${id}`,
    init: initParams,
  });
}

/** Stores private key metadata into the wrapped keys service backend
 *
 * @param { StoreKeyParams } params Parameters required to store the private key metadata
 * @returns { Promise<true> } `true` on successful write to the service. Otherwise, this method throws an error.
 */
export async function storePrivateKeyMetadata(
  params: StoreKeyParams
): Promise<StoreEncryptedKeyResult> {
  const { litNetwork, sessionSig, storedKeyMetadata } = params;

  const { baseUrl, initParams } = getBaseRequestParams({
    litNetwork,
    sessionSig,
    method: 'POST',
  });

  return await makeRequest<StoredKeyMetadata>({
    url: baseUrl,
    init: {
      ...initParams,
      body: JSON.stringify(storedKeyMetadata),
    },
  });
}
