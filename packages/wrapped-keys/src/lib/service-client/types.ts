import { AuthSig, LIT_NETWORKS_KEYS } from '@lit-protocol/types';

import { StoredKeyData } from '../types';

interface BaseApiParams {
  sessionSig: AuthSig;
  litNetwork: LIT_NETWORKS_KEYS;
}

export type FetchKeyParams = BaseApiParams & {
  pkpAddress: string;
  id: string;
};

export type ListKeysParams = BaseApiParams & { pkpAddress: string };

export type SupportedNetworks = Extract<
  LIT_NETWORKS_KEYS,
  'cayenne' | 'manzano' | 'habanero' | 'datil-dev' | 'datil-test' | 'datil'
>;

export interface StoreKeyParams extends BaseApiParams {
  storedKeyMetadata: Pick<
    StoredKeyData,
    'publicKey' | 'keyType' | 'dataToEncryptHash' | 'ciphertext' | 'memo'
  >;
}

export interface StoreKeyBatchParams extends BaseApiParams {
  storedKeyMetadataBatch: Pick<
    StoredKeyData,
    'publicKey' | 'keyType' | 'dataToEncryptHash' | 'ciphertext' | 'memo'
  >[];
}

export interface BaseRequestParams {
  sessionSig: AuthSig;
  method: 'GET' | 'POST';
  litNetwork: LIT_NETWORKS_KEYS;
  requestId: string;
}
