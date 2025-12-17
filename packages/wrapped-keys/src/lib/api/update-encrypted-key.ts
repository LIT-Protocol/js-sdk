import { updatePrivateKey } from '../service-client';
import { UpdateEncryptedKeyParams, UpdateEncryptedKeyResult } from '../types';
import { getFirstSessionSig, getPkpAddressFromSessionSig } from './utils';

/** Update an existing wrapped key and append the previous state to versions.
 *
 * @param { UpdateEncryptedKeyParams } params Parameters required to update the encrypted private key
 * @returns { Promise<UpdateEncryptedKeyResult> } id/pkpAddress/updatedAt on successful update
 */
export async function updateEncryptedKey(
  params: UpdateEncryptedKeyParams
): Promise<UpdateEncryptedKeyResult> {
  const {
    pkpSessionSigs,
    litNodeClient,
    id,
    ciphertext,
    evmContractConditions,
    memo,
  } = params;

  const sessionSig = getFirstSessionSig(pkpSessionSigs);
  const pkpAddress = getPkpAddressFromSessionSig(sessionSig);

  return updatePrivateKey({
    pkpAddress,
    id,
    sessionSig,
    ciphertext,
    evmContractConditions,
    memo,
    litNetwork: litNodeClient.config.litNetwork,
  });
}
