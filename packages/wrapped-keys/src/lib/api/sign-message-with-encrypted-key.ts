import {
  getFirstSessionSig,
  getPkpAccessControlCondition,
  getPkpAddressFromSessionSig,
  getLitNetworkFromClient,
} from './utils';
import { signMessageWithLitAction } from '../lit-actions-client';
import { getLitActionCodeOrCid } from '../lit-actions-client/utils';
import { fetchPrivateKey } from '../service-client';
import { SignMessageWithEncryptedKeyParams } from '../types';

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
  const { litClient, network, pkpSessionSigs, id } = params;

  const sessionSig = getFirstSessionSig(pkpSessionSigs);
  const pkpAddress = getPkpAddressFromSessionSig(sessionSig);
  const litNetwork = getLitNetworkFromClient(litClient);

  const storedKeyMetadata = await fetchPrivateKey({
    pkpAddress,
    id,
    sessionSig,
    litNetwork,
  });

  const allowPkpAddressToDecrypt = getPkpAccessControlCondition(
    storedKeyMetadata.pkpAddress
  );

  const { litActionCode, litActionIpfsCid } = getLitActionCodeOrCid(
    network,
    'signMessage'
  );

  return signMessageWithLitAction({
    ...params,
    litClient,
    litActionIpfsCid: litActionCode ? undefined : litActionIpfsCid,
    litActionCode: litActionCode ? litActionCode : undefined,
    accessControlConditions: [allowPkpAddressToDecrypt],
    pkpSessionSigs,
    storedKeyMetadata,
  });
}
