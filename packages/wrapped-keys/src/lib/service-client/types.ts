import { AuthSig, LIT_NETWORKS_KEYS } from '@lit-protocol/types';

import { StoredKeyMetadata } from '../types';

interface BaseApiParams {
  sessionSig: AuthSig;
  litNetwork: LIT_NETWORKS_KEYS;
}

export type FetchKeyParams = BaseApiParams;

export type SupportedNetworks = Extract<
  LIT_NETWORKS_KEYS,
  'cayenne' | 'manzano' | 'habanero'
>;

export interface StoreKeyParams extends BaseApiParams {
  storedKeyMetadata: Pick<
    StoredKeyMetadata,
    'pkpAddress' | 'publicKey' | 'keyType' | 'dataToEncryptHash' | 'ciphertext'
  >;
}

export interface BaseRequestParams {
  sessionSig: AuthSig;
  method: 'GET' | 'POST';
  litNetwork: LIT_NETWORKS_KEYS;
}
