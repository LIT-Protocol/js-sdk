import { signMessageWithLitAction } from '../lit-actions-client';
import { getLitActionCid } from '../lit-actions-client/utils';
import { fetchPrivateKeyMetadata } from '../service-client';
import { SignMessageWithEncryptedKeyParams } from '../types';
import { getFirstSessionSig, getPkpAccessControlCondition } from '../utils';

/**
 * Signs a message inside the Lit Action using the previously persisted wrapped key associated with the current LIT PK.
 * This method fetches the encrypted key from the wrapped keys service, then executes a Lit Action that decrypts the key inside the LIT action and uses
 * the decrypted key to sign the provided transaction
 *
 * NOTE: If you use `custom` as `network`, you must provide either an IPFS CID or the direct source code of the LIT action you want
 * to be responsible for decrypting the encrypted key and signing the message
 *
 * @param { SignMessageWithEncryptedKeyParams } params Parameters to use for signing the message
 *
 * @returns { Promise<string> } - The signed message
 */
export async function signMessageWithEncryptedKey(
  params: SignMessageWithEncryptedKeyParams
): Promise<string> {
  const { litNodeClient, network, pkpSessionSigs } = params;

  const sessionSig = getFirstSessionSig(pkpSessionSigs);
  const storedKeyMetadata = await fetchPrivateKeyMetadata({
    sessionSig,
    litNodeClient,
  });

  const allowPkpAddressToDecrypt = getPkpAccessControlCondition(
    storedKeyMetadata.pkpAddress
  );

  return signMessageWithLitAction({
    ...params,
    ...(network === 'evm' || network == 'solana'
      ? { litActionIpfsCid: getLitActionCid(network, 'signMessage') }
      : {}),
    accessControlConditions: [allowPkpAddressToDecrypt],
    pkpSessionSigs,
    storedKeyMetadata,
  });
}
