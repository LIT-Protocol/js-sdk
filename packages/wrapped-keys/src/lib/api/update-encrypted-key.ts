import { updatePrivateKey } from '../service-client';
import { UpdateEncryptedKeyParams, UpdateEncryptedKeyResult } from '../types';
import {
  getFirstSessionSig,
  getLitNetworkFromClient,
  getPkpAddressFromSessionSig,
} from './utils';

/**
 * Updates an existing wrapped key and appends the previous state to versions.
 *
 * @param { UpdateEncryptedKeyParams } params Parameters required to update the encrypted private key
 * @returns { Promise<UpdateEncryptedKeyResult> } An object containing the id, pkpAddress, and updatedAt timestamp of the updated key
 */
export async function updateEncryptedKey(
  params: UpdateEncryptedKeyParams
): Promise<UpdateEncryptedKeyResult> {
  const {
    pkpSessionSigs,
    litClient,
    id,
    ciphertext,
    evmContractConditions,
    memo,
  } = params;

  const sessionSig = getFirstSessionSig(pkpSessionSigs);
  const pkpAddress = getPkpAddressFromSessionSig(sessionSig);
  const litNetwork = getLitNetworkFromClient(litClient);

  return updatePrivateKey({
    pkpAddress,
    id,
    sessionSig,
    ciphertext,
    evmContractConditions,
    memo,
    litNetwork,
  });
}
