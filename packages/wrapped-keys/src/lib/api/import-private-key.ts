import {
  getFirstSessionSig,
  getPkpAccessControlCondition,
  getPkpAddressFromSessionSig,
} from './utils';
import { LIT_PREFIX } from '../constants';
import { storePrivateKey } from '../service-client';
import { ImportPrivateKeyParams, ImportPrivateKeyResult } from '../types';

/**
 * Import a provided private key into the wrapped keys service backend.
 * First, the key is pre-pended with `LIT_PREFIX` for security reasons, then the salted key is encrypted and stored in the backend service.
 * The key will be associated with the PKP address embedded in the `pkpSessionSigs` you provide. One and only one wrapped key can be associated with a given LIT PKP.
 *
 * @param { ImportPrivateKeyParams } params The parameters required to import the private key into the wrapped keys backend service
 *
 * @returns { Promise<ImportPrivateKeyResult> } - The LIT PKP Address associated with the Wrapped Key
 */
export async function importPrivateKey(
  params: ImportPrivateKeyParams
): Promise<ImportPrivateKeyResult> {
  const {
    pkpSessionSigs,
    privateKey,
    publicKey,
    keyType,
    litNodeClient,
    memo,
  } = params;

  const firstSessionSig = getFirstSessionSig(pkpSessionSigs);
  const pkpAddress = getPkpAddressFromSessionSig(firstSessionSig);
  const allowPkpAddressToDecrypt = getPkpAccessControlCondition(pkpAddress);

  const saltedPrivateKey = LIT_PREFIX + privateKey;

  const { ciphertext, dataToEncryptHash } = await litNodeClient.encrypt({
    accessControlConditions: [allowPkpAddressToDecrypt],
    dataToEncrypt: Buffer.from(saltedPrivateKey, 'utf8'),
  });

  const { id } = await storePrivateKey({
    sessionSig: firstSessionSig,
    litNetwork: litNodeClient.config.litNetwork,
    storedKeyMetadata: {
      ciphertext,
      publicKey,
      keyType,
      dataToEncryptHash,
      memo,
    },
  });

  return { pkpAddress, id };
}
