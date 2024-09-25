import { LIT_NETWORK_VALUES } from '@lit-protocol/constants';
import { AuthSig, LIT_NETWORKS_KEYS } from '@lit-protocol/types';

import { StoredKeyData } from '../types';

interface BaseApiParams {
  sessionSig: AuthSig;
  litNetwork: LIT_NETWORK_VALUES;
}

export type FetchKeyParams = BaseApiParams & {
  id: string;
};

export type ListKeysParams = BaseApiParams;

export type SupportedNetworks = Extract<
  LIT_NETWORK_VALUES,
  'cayenne' | 'manzano' | 'habanero' | 'datil-dev' | 'datil-test' | 'datil'
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
  requestId: string;
}
