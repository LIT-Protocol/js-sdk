import { getKeyTypeFromNetwork } from './utils';
import { batchGenerateKeysWithLitAction } from '../lit-actions-client';
import { getLitActionCodeOrCidCommon } from '../lit-actions-client/utils';
import { storePrivateKey } from '../service-client';
import {
  BatchGeneratePrivateKeysActionResult,
  BatchGeneratePrivateKeysParams,
  BatchGeneratePrivateKeysResult,
} from '../types';
import {
  getFirstSessionSig,
  getPkpAccessControlCondition,
  getPkpAddressFromSessionSig,
} from '../utils';

/**
 *  TODO: Document batch behaviour
 * @param { BatchGeneratePrivateKeysParams } params Parameters to use for generating keys and optionally signing messages
 *
 * @returns { Promise<BatchGeneratePrivateKeysResult> } - The generated keys and, optionally, signed messages
 */
export async function batchGeneratePrivateKeys(
  params: BatchGeneratePrivateKeysParams
): Promise<BatchGeneratePrivateKeysResult> {
  const { pkpSessionSigs, litNodeClient } = params;

  const sessionSig = getFirstSessionSig(pkpSessionSigs);
  const pkpAddress = getPkpAddressFromSessionSig(sessionSig);

  const allowPkpAddressToDecrypt = getPkpAccessControlCondition(pkpAddress);

  const { litActionCode, litActionIpfsCid } = getLitActionCodeOrCidCommon(
    'batchGenerateEncryptedKeys'
  );

  const actionResults = await batchGenerateKeysWithLitAction({
    ...params,
    litActionIpfsCid: litActionCode ? undefined : litActionIpfsCid,
    litActionCode: litActionCode ? litActionCode : undefined,
    accessControlConditions: [allowPkpAddressToDecrypt],
    pkpSessionSigs,
  });

  const results = await Promise.all(
    actionResults.map(
      async (result): Promise<BatchGeneratePrivateKeysActionResult> => {
        const { generateEncryptedPrivateKey, network } = result;

        const signature = result.signMessage?.signature;

        const { id } = await storePrivateKey({
          sessionSig,
          storedKeyMetadata: {
            ...generateEncryptedPrivateKey,
            keyType: getKeyTypeFromNetwork(network),
            pkpAddress,
          },
          litNetwork: litNodeClient.config.litNetwork,
        });

        return {
          ...(signature ? { signMessage: { signature } } : {}),
          generateEncryptedPrivateKey: {
            memo: generateEncryptedPrivateKey.memo,
            id,
            generatedPublicKey: generateEncryptedPrivateKey.publicKey,
            pkpAddress,
          },
        };
      }
    )
  );

  return { pkpAddress, results };
}
