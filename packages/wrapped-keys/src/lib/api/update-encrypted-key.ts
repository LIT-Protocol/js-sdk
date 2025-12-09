import { updatePrivateKey } from '../service-client';
import { UpdateEncryptedKeyParams, UpdateEncryptedKeyResult } from '../types';
import {
  getFirstSessionSig,
  getLitNetworkFromClient,
  getPkpAddressFromSessionSig,
} from './utils';

/** Update an existing wrapped key and append the previous state to versions. */
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
