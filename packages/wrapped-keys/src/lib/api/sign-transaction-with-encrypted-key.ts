import {
  getFirstSessionSig,
  getPkpAccessControlCondition,
  getPkpAddressFromSessionSig,
  getLitNetworkFromClient,
} from './utils';
import { signTransactionWithLitAction } from '../lit-actions-client';
import { getLitActionCodeOrCid } from '../lit-actions-client/utils';
import { fetchPrivateKey } from '../service-client';
import { SignTransactionWithEncryptedKeyParams } from '../types';

/**
 * Signs a transaction inside the Lit Action using the previously persisted wrapped key associated with the current LIT PK.
 * This method fetches the encrypted key from the wrapped keys service, then executes a Lit Action that decrypts the key inside the LIT action and uses
 * the decrypted key to sign the provided transaction
 * use `versionedTransaction: true` to sign a versioned transaction and `false` for a legacy one
 * Optionally, if you pass `broadcast: true`, the LIT action will also submit the signed transaction to the associated RPC endpoint on your behalf
 *
 * @param { SignTransactionWithEncryptedKeyParams } params Parameters required to sign the requested transaction
 *
 * @returns { string } The signed transaction OR its transaction hash if you set `broadcast: true` and the LIT action supports this functionality.
 */
export async function signTransactionWithEncryptedKey(
  params: SignTransactionWithEncryptedKeyParams
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
    'signTransaction'
  );

  return signTransactionWithLitAction({
    ...params,
    litClient,
    litActionIpfsCid: litActionCode ? undefined : litActionIpfsCid,
    litActionCode: litActionCode ? litActionCode : undefined,
    storedKeyMetadata,
    accessControlConditions: [allowPkpAddressToDecrypt],
  });
}
