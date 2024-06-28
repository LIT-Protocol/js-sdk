import { generateKeyWithLitAction } from '../lit-actions-client';
import { getLitActionCid } from '../lit-actions-client/utils';
import { storePrivateKeyMetadata } from '../service-client';
import {
  GeneratePrivateKeyParams,
  GeneratePrivateKeyResult,
  KeyType,
  Network,
} from '../types';
import {
  getFirstSessionSig,
  getPkpAccessControlCondition,
  getPkpAddressFromSessionSig,
} from '../utils';

function getKeyTypeFromNetwork(network: Network): KeyType {
  if (network === 'evm') {
    return 'K256';
  } else if (network === 'solana') {
    return 'ed25519';
  } else {
    throw new Error('Network not implemented in generate-private-key');
  }
}
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
      publicKey,
      keyType: getKeyTypeFromNetwork(network),
      dataToEncryptHash,
      pkpAddress,
    },
    litNetwork: litNodeClient.config.litNetwork,
  });

  return {
    pkpAddress,
    generatedPublicKey: publicKey,
  };
}
