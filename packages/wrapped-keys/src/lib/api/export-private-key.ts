import {
  getFirstSessionSig,
  getPkpAccessControlCondition,
  getPkpAddressFromSessionSig,
} from './utils';
import { exportPrivateKeyWithLitAction } from '../lit-actions-client';
import { getLitActionCodeOrCid } from '../lit-actions-client/utils';
import { fetchPrivateKey } from '../service-client';
import { ExportPrivateKeyParams, ExportPrivateKeyResult } from '../types';

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
  const { litNodeClient, network, pkpSessionSigs, id } = params;

  const sessionSig = getFirstSessionSig(pkpSessionSigs);
  const pkpAddress = getPkpAddressFromSessionSig(sessionSig);

  const storedKeyMetadata = await fetchPrivateKey({
    pkpAddress,
    id,
    sessionSig,
    litNetwork: litNodeClient.config.litNetwork,
  });

  const allowPkpAddressToDecrypt = getPkpAccessControlCondition(
    storedKeyMetadata.pkpAddress
  );

  const { litActionCode, litActionIpfsCid } = getLitActionCodeOrCid(
    network,
    'exportPrivateKey'
  );

  return exportPrivateKeyWithLitAction({
    ...params,
    litActionIpfsCid: litActionCode ? undefined : litActionIpfsCid,
    litActionCode: litActionCode ? litActionCode : undefined,
    accessControlConditions: [allowPkpAddressToDecrypt],
    pkpSessionSigs,
    storedKeyMetadata,
  });
}
