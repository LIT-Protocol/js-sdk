import { AuthSig, LIT_NETWORKS_KEYS } from '@lit-protocol/types';

import { StoredKeyData } from '../types';

interface BaseApiParams {
  sessionSig: AuthSig;
  litNetwork: LIT_NETWORKS_KEYS;
}

export type FetchKeyParams = BaseApiParams & {
  id: string;
};

export type ListKeysParams = BaseApiParams;

export type SupportedNetworks = Extract<
  LIT_NETWORKS_KEYS,
  'cayenne' | 'manzano' | 'habanero' | 'datil-dev' | 'datil-test'
>;

export interface StoreKeyParams extends BaseApiParams {
  storedKeyMetadata: Pick<
    StoredKeyData,
    | 'pkpAddress'
    | 'publicKey'
    | 'keyType'
    | 'dataToEncryptHash'
    | 'ciphertext'
    | 'memo'
  >;
}

export interface BaseRequestParams {
  sessionSig: AuthSig;
  method: 'GET' | 'POST';
  litNetwork: LIT_NETWORKS_KEYS;
}
