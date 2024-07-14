import { exportPrivateKeyWithLitAction } from '../lit-actions-client';

import { fetchPrivateKeyMetadata } from '../service-client';
import { ExportPrivateKeyParams, ExportPrivateKeyResult } from '../types';
import { getFirstSessionSig, getPkpAccessControlCondition } from '../utils';
import { getLitActionCid } from '../lit-actions-client/utils';

/**
 * Exports a previously persisted private key from the wrapped keys service for direct use by the caller, along with the keys metadata.
 * This method fetches the encrypted key from the wrapped keys service, then executes a Lit Action that decrypts the key inside the LIT action and
 * removes the salt from the decrypted key.
 *
 * @param { ExportPrivateKeyParams } params Parameters required to export the private key
 *
 * @returns { Promise<ExportPrivateKeyResult> } - The decrypted private key of the Wrapped Key along with all the associated key info and LIT PKP Address associated with the Wrapped Key
 */
export async function exportPrivateKey(
  params: ExportPrivateKeyParams
): Promise<ExportPrivateKeyResult> {
  const { litNodeClient, network, pkpSessionSigs } = params;

  const sessionSig = getFirstSessionSig(pkpSessionSigs);
  const storedKeyMetadata = await fetchPrivateKeyMetadata({
    sessionSig,
    litNetwork: litNodeClient.config.litNetwork,
  });

  const allowPkpAddressToDecrypt = getPkpAccessControlCondition(
    storedKeyMetadata.pkpAddress
  );

  return exportPrivateKeyWithLitAction({
    ...params,
    litActionIpfsCid: getLitActionCid(network, 'exportPrivateKey'),
    accessControlConditions: [allowPkpAddressToDecrypt],
    pkpSessionSigs,
    storedKeyMetadata,
  });
}
