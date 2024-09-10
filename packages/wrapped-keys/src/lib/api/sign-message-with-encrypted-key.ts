import { signMessageWithLitAction } from '../lit-actions-client';
import { getLitActionCid, getLitActionCode } from '../lit-actions-client/utils';
import { fetchPrivateKey } from '../service-client';
import { SignMessageWithEncryptedKeyParams } from '../types';
import { getFirstSessionSig, getPkpAccessControlCondition } from '../utils';

/**
 * Signs a message inside the Lit Action using the previously persisted wrapped key associated with the current LIT PK.
 * This method fetches the encrypted key from the wrapped keys service, then executes a Lit Action that decrypts the key inside the LIT action and uses
 * the decrypted key to sign the provided transaction
 *
 * @param { SignMessageWithEncryptedKeyParams } params Parameters to use for signing the message
 *
 * @returns { Promise<string> } - The signed message
 */
export async function signMessageWithEncryptedKey(
  params: SignMessageWithEncryptedKeyParams
): Promise<string> {
  const { litNodeClient, network, pkpSessionSigs, id } = params;

  const sessionSig = getFirstSessionSig(pkpSessionSigs);
  const storedKeyMetadata = await fetchPrivateKey({
    id,
    sessionSig,
    litNetwork: litNodeClient.config.litNetwork,
  });

  console.log('fetched metadata', storedKeyMetadata);

  const allowPkpAddressToDecrypt = getPkpAccessControlCondition(
    storedKeyMetadata.pkpAddress
  );

  const litActionCode = getLitActionCode(network, 'signMessage');
  if (!litActionCode) {
    console.warn('Could not load bundled code. Using IPFS CID instead.');
  }

  return signMessageWithLitAction({
    ...params,
    litActionIpfsCid: litActionCode
      ? undefined
      : getLitActionCid(network, 'signMessage'),
    litActionCode: litActionCode ? litActionCode : undefined,
    accessControlConditions: [allowPkpAddressToDecrypt],
    pkpSessionSigs,
    storedKeyMetadata,
  });
}
