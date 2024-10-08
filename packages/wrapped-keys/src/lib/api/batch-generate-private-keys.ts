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

  return Promise.all(
    actionResults.map(
      async (result): Promise<BatchGeneratePrivateKeysActionResult> => {
        const { generatedPrivateKey, network } = result;

        const signature = result.signedMessage?.signature;

        const { id } = await storePrivateKey({
          sessionSig,
          storedKeyMetadata: {
            ...generatedPrivateKey,
            keyType: getKeyTypeFromNetwork(network),
            pkpAddress,
          },
          litNetwork: litNodeClient.config.litNetwork,
        });

        return {
          ...(signature ? { signedMessage: { signature } } : {}),
          generatedPrivateKey: {
            memo: generatedPrivateKey.memo,
            id: id,
            generatedPublicKey: generatedPrivateKey.publicKey,
            pkpAddress,
          },
        };
      }
    )
  );
}
