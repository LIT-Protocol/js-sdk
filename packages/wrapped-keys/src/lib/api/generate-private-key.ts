import { LIT_CURVE } from '@lit-protocol/constants';

import { generateKeyWithLitAction } from '../lit-actions-client';
import { getLitActionCid } from '../lit-actions-client/utils';
import { storePrivateKeyMetadata } from '../service-client';
import { GeneratePrivateKeyParams, GeneratePrivateKeyResult } from '../types';
import {
  getFirstSessionSig,
  getPkpAccessControlCondition,
  getPkpAddressFromSessionSig,
} from '../utils';

/**
 * Generates a random private key inside a Lit Action, and persists the key and its metadata to the wrapped keys service.
 * Returns the public key of the random private key, and the PKP address that it was associated with.
 * We don't return the generated wallet address since it can be derived from the publicKey
 *
 * The key will be associated with the PKP address embedded in the `pkpSessionSigs` you provide. One and only one wrapped key can be associated with a given LIT PKP.
 *
 * @param { GeneratePrivateKeyParams } params - Required parameters to generate the private key
 *
 * @returns { Promise<GeneratePrivateKeyResult> } - The publicKey of the generated random private key and the LIT PKP Address associated with the Wrapped Key
 */
export async function generatePrivateKey(
  params: GeneratePrivateKeyParams
): Promise<GeneratePrivateKeyResult> {
  const { pkpSessionSigs, network, litNodeClient } = params;

  const firstSessionSig = getFirstSessionSig(pkpSessionSigs);
  const pkpAddress = getPkpAddressFromSessionSig(firstSessionSig);
  const allowPkpAddressToDecrypt = getPkpAccessControlCondition(pkpAddress);

  const { ciphertext, dataToEncryptHash, publicKey } =
    await generateKeyWithLitAction({
      ...params,
      pkpAddress,
      litActionIpfsCid: getLitActionCid(network, 'generateEncryptedKey'),
      accessControlConditions: [allowPkpAddressToDecrypt],
    });

  await storePrivateKeyMetadata({
    sessionSig: firstSessionSig,
    storedKeyMetadata: {
      ciphertext,
      address: publicKey, // FIXME: If we're storing address and it is _not_ the publicKey directly, then we need the generate LIT action to return it for us
      keyType: LIT_CURVE.EcdsaK256, // FIXME: Should be returned by the LIT action; we won't know what it is unless it's provided.
      dataToEncryptHash,
      pkpAddress,
    },
    litNodeClient,
  });

  return {
    pkpAddress,
    generatedPublicKey: publicKey,
  };
}
