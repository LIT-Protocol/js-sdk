import { getFirstSessionSig, getPkpAddressFromSessionSig } from './utils';
import { storePrivateKey } from '../service-client';
import { StoreEncryptedKeyParams, StoreEncryptedKeyResult } from '../types';

/** Stores an encrypted private key and its metadata to the wrapped keys backend service
 *
 * @param { StoreEncryptedKeyParams } params Parameters required to fetch the encrypted private key metadata
 * @returns { Promise<StoreEncryptedKeyResult> } The encrypted private key and its associated metadata
 */
export async function storeEncryptedKey(
  params: StoreEncryptedKeyParams
): Promise<StoreEncryptedKeyResult> {
  const { pkpSessionSigs, litNodeClient } = params;
  const sessionSig = getFirstSessionSig(pkpSessionSigs);

  const { publicKey, keyType, dataToEncryptHash, ciphertext, memo } = params;

  return storePrivateKey({
    storedKeyMetadata: {
      publicKey,
      keyType,
      dataToEncryptHash,
      ciphertext,
      memo,
    },
    sessionSig,
    litNetwork: litNodeClient.config.litNetwork,
  });
}
