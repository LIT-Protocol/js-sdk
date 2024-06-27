import { FetchKeyParams, StoreKeyParams } from './types';
import { getBaseRequestParams, makeRequest } from './utils';
import { StoredKeyMetadata } from '../types';

/** Fetches previously stored private key metadata from the wrapped keys service
 *
 * @param { FetchKeyParams } params Parameters required to fetch the private key metadata
 * @returns { Promise<StoredKeyMetadata> } The private key metadata object
 */
export async function fetchPrivateKeyMetadata(
  params: FetchKeyParams
): Promise<StoredKeyMetadata> {
  const { litNetwork, sessionSig } = params;

  const { url, initParams } = getBaseRequestParams({
    litNetwork,
    sessionSig,
    method: 'GET',
  });

  return makeRequest<StoredKeyMetadata>({
    url,
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
): Promise<boolean> {
  const { litNetwork, sessionSig, storedKeyMetadata } = params;

  const { url, initParams } = getBaseRequestParams({
    litNetwork,
    sessionSig,
    method: 'POST',
  });

  await makeRequest<StoredKeyMetadata>({
    url,
    init: {
      ...initParams,
      body: JSON.stringify(storedKeyMetadata),
    },
  });

  return true;
}
