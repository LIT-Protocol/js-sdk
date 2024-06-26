import { signTransactionWithLitAction } from '../lit-actions-client';
import { getLitActionCid } from '../lit-actions-client/utils';
import { fetchPrivateKeyMetadata } from '../service-client';
import { SignTransactionWithEncryptedKeyParams } from '../types';
import { getFirstSessionSig, getPkpAccessControlCondition } from '../utils';

/**
 * Signs a transaction inside the Lit Action using the previously persisted wrapped key associated with the current LIT PK.
 * This method fetches the encrypted key from the wrapped keys service, then executes a Lit Action that decrypts the key inside the LIT action and uses
 * the decrypted key to sign the provided transaction
 * Optionally, if you pass `broadcast: true`, the LIT action will also submit the signed transaction to the associated RPC endpoint on your behalf
 *
 * * NOTE: If you use `custom` as `network`, you must provide either an IPFS CID or the direct source code of the LIT action you want
 * to be responsible for decrypting the encrypted key, signing the message, and supporting `broadcast: true` if you set it.
 *
 * @param { SignTransactionWithEncryptedKeyParams } params Parameters required to sign the requested transaction
 *
 * @returns { string } The signed transaction OR its transaction hash if you set `broadcast: true` and the LIT action supports this functionality.
 */
export async function signTransactionWithEncryptedKey(
  params: SignTransactionWithEncryptedKeyParams
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

  return signTransactionWithLitAction({
    ...params,
    ...(network === 'evm' || network === 'solana'
      ? { litActionIpfsCid: getLitActionCid(network, 'signTransaction') }
      : {}),
    storedKeyMetadata,
    accessControlConditions: [allowPkpAddressToDecrypt],
  });
}
