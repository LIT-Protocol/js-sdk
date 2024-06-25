import {
  AuthSig,
  ILitNodeClient,
  LIT_NETWORKS_KEYS,
} from '@lit-protocol/types';

interface BaseApiParams {
  sessionSig: AuthSig;
  litNodeClient: ILitNodeClient;
}

export type FetchKeyParams = BaseApiParams;

export type SupportedNetworks = Extract<
  LIT_NETWORKS_KEYS,
  'cayenne' | 'manzano' | 'habanero'
>;

export interface StoredKeyMetadata {
  ciphertext: string;
  dataToEncryptHash: string;
  address: string;
  pkpAddress: string;
  algo: string;
  litNetwork: SupportedNetworks;
}

export interface StoreKeyParams extends BaseApiParams {
  storedKeyMetadata: Pick<
    StoredKeyMetadata,
    'pkpAddress' | 'address' | 'algo' | 'dataToEncryptHash' | 'ciphertext'
  >;
}

export interface BaseRequestParams {
  sessionSig: AuthSig;
  method: 'GET' | 'POST';
  litNetwork: LIT_NETWORKS_KEYS;
}
