import { AuthSig, LIT_NETWORKS_KEYS } from '@lit-protocol/types';

interface BaseApiParams {
  sessionSig: AuthSig;
  litNetwork: LIT_NETWORKS_KEYS;
}

export type FetchKeyParams = BaseApiParams;

export type SupportedNetworks = Extract<
  LIT_NETWORKS_KEYS,
  'cayenne' | 'manzano' | 'habanero'
>;

/** Metadata for a key that has been stored, encrypted, on the wrapped keys backend service
 *
 * @property { string } ciphertext The base64 encoded, salted & encrypted private key
 * @property { string } dataToEncryptHash SHA-256 of the ciphertext
 * @property { string } publicKey The public key of the encrypted private key
 * @property { string } pkpAddress The LIT PKP address that is associated with the encrypted private key
 * @property { string } keyType The type of key that was encrypted -- e.g. ed25519, K256, etc.
 * @property { LIT_NETWORKS_KEYS } litNetwork The LIT network that the client who stored the key was connected to
 */
export interface StoredKeyMetadata {
  ciphertext: string;
  dataToEncryptHash: string;
  publicKey: string;
  pkpAddress: string;
  keyType: string;
  litNetwork: LIT_NETWORKS_KEYS;
}

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
