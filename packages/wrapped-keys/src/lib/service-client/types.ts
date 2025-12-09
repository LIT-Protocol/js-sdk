import { LIT_NETWORK_VALUES } from '@lit-protocol/constants';
import { AuthSig, LIT_NETWORKS_KEYS } from '@lit-protocol/types';

import { StoredKeyData } from '../types';

interface BaseApiParams {
  sessionSig: AuthSig;
  litNetwork: LIT_NETWORK_VALUES;
}

export type FetchKeyParams = BaseApiParams & {
  pkpAddress: string;
  id: string;
  includeVersions?: boolean;
};

export type ListKeysParams = BaseApiParams & { pkpAddress: string };

export type SupportedNetworks = Extract<
  LIT_NETWORK_VALUES,
  'naga-dev' | 'naga-test'
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

export interface UpdateKeyParams extends BaseApiParams {
  pkpAddress: string;
  id: string;
  ciphertext: string;
  evmContractConditions?: string;
  memo?: string;
}

export interface BaseRequestParams {
  sessionSig: AuthSig;
  method: 'GET' | 'POST' | 'PUT';
  litNetwork: LIT_NETWORKS_KEYS;
  requestId: string;
}
