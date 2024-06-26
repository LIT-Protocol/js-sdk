import { decryptToString } from '@lit-protocol/encryption';

import { CHAIN_ETHEREUM, LIT_PREFIX } from '../constants';
import { fetchPrivateKeyMetadata } from '../service-client';
import { ExportPrivateKeyParams, ExportPrivateKeyResult } from '../types';
import {
  getFirstSessionSig,
  getPkpAccessControlCondition,
  getPkpAddressFromSessionSig,
} from '../utils';

/** Exports a previously persisted private key from the wrapped keys service for direct use by the caller, along with the keys metadata
 *
 * @param { ExportPrivateKeyParams } params Parameters required to export the private key
 */
export async function exportPrivateKey(
  params: ExportPrivateKeyParams
): Promise<ExportPrivateKeyResult> {
  const { pkpSessionSigs, litNodeClient } = params;

  const sessionSig = getFirstSessionSig(pkpSessionSigs);
  const pkpAddress = getPkpAddressFromSessionSig(sessionSig);
  const allowPkpAddressToDecrypt = getPkpAccessControlCondition(pkpAddress);

  const privateKeyMetadata = await fetchPrivateKeyMetadata({
    sessionSig,
    litNodeClient,
  });

  const { ciphertext, dataToEncryptHash, ...privateKeyMetadataMinusEncrypted } =
    privateKeyMetadata;

  const decryptedPrivateKey = await decryptToString(
    {
      accessControlConditions: [allowPkpAddressToDecrypt],
      chain: CHAIN_ETHEREUM, // FIXME: This won't always be true.
      ciphertext,
      dataToEncryptHash,
      sessionSigs: pkpSessionSigs,
    },
    litNodeClient
  );

  // It will be of the form lit_<privateKey>
  if (!decryptedPrivateKey.startsWith(LIT_PREFIX)) {
    throw new Error(
      `PKey was not encrypted with salt; all wrapped keys must be prefixed with '${LIT_PREFIX}'`
    );
  }

  return {
    decryptedPrivateKey: decryptedPrivateKey.slice(LIT_PREFIX.length),
    ...privateKeyMetadataMinusEncrypted,
  };
}
