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
 * @param {UpdateEncryptedKeyParams} params - The parameters required to update the encrypted private key.
 * @param {Record<string, any>} params.pkpSessionSigs - The session signatures for the PKP.
 * @param {any} params.litClient - The Lit Protocol client instance.
 * @param {string} params.id - The unique identifier of the wrapped key to update.
 * @param {string} params.ciphertext - The new encrypted private key ciphertext.
 * @param {any} params.evmContractConditions - The EVM contract conditions for access control.
 * @param {string} [params.memo] - An optional memo to associate with the update.
 * @returns {Promise<UpdateEncryptedKeyResult>} An object containing the id, pkpAddress, and updatedAt timestamp of the updated key.
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
