import {
  getFirstSessionSig,
  getKeyTypeFromNetwork,
  getPkpAccessControlCondition,
  getPkpAddressFromSessionSig,
  getLitNetworkFromClient,
} from './utils';
import { generateKeyWithLitAction } from '../lit-actions-client';
import { getLitActionCodeOrCid } from '../lit-actions-client/utils';
import { storePrivateKey } from '../service-client';
import { GeneratePrivateKeyParams, GeneratePrivateKeyResult } from '../types';

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
  const { pkpSessionSigs, network, litClient, memo } = params;

  const firstSessionSig = getFirstSessionSig(pkpSessionSigs);
  const pkpAddress = getPkpAddressFromSessionSig(firstSessionSig);
  const allowPkpAddressToDecrypt = getPkpAccessControlCondition(pkpAddress);

  // console.log('firstSessionSig:', firstSessionSig);
  // console.log('pkpAddress:', pkpAddress);
  // console.log('allowPkpAddressToDecrypt:', allowPkpAddressToDecrypt);

  const { litActionCode, litActionIpfsCid } = getLitActionCodeOrCid(
    network,
    'generateEncryptedKey'
  );
  // console.log('litActionCode:', litActionCode);
  // console.log('litActionIpfsCid:', litActionIpfsCid);

  const { ciphertext, dataToEncryptHash, publicKey } =
    await generateKeyWithLitAction({
      ...params,
      litClient,
      pkpAddress,
      litActionIpfsCid: litActionCode ? undefined : litActionIpfsCid,
      litActionCode: litActionCode ? litActionCode : undefined,
      accessControlConditions: [allowPkpAddressToDecrypt],
    });

  // console.log('ciphertext:', ciphertext);
  // console.log('dataToEncryptHash:', dataToEncryptHash);
  // console.log('publicKey:', publicKey);

  const { id } = await storePrivateKey({
    sessionSig: firstSessionSig,
    storedKeyMetadata: {
      ciphertext,
      publicKey,
      keyType: getKeyTypeFromNetwork(network),
      dataToEncryptHash,
      memo,
    },
    litNetwork: getLitNetworkFromClient(litClient),
  });

  return {
    pkpAddress,
    id,
    generatedPublicKey: publicKey,
  };
}
