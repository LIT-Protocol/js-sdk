import {
  getFirstSessionSig,
  getKeyTypeFromNetwork,
  getPkpAccessControlCondition,
  getPkpAddressFromSessionSig,
  getLitNetworkFromClient,
} from './utils';
import { batchGenerateKeysWithLitAction } from '../lit-actions-client';
import { getLitActionCodeOrCidCommon } from '../lit-actions-client/utils';
import { storePrivateKeyBatch } from '../service-client';
import {
  BatchGeneratePrivateKeysActionResult,
  BatchGeneratePrivateKeysParams,
  BatchGeneratePrivateKeysResult,
} from '../types';

/**
 *  TODO: Document batch behaviour
 * @param { BatchGeneratePrivateKeysParams } params Parameters to use for generating keys and optionally signing messages
 *
 * @returns { Promise<BatchGeneratePrivateKeysResult> } - The generated keys and, optionally, signed messages
 */
export async function batchGeneratePrivateKeys(
  params: BatchGeneratePrivateKeysParams
): Promise<BatchGeneratePrivateKeysResult> {
  const { pkpSessionSigs, litClient } = params;

  const sessionSig = getFirstSessionSig(pkpSessionSigs);
  const pkpAddress = getPkpAddressFromSessionSig(sessionSig);

  const allowPkpAddressToDecrypt = getPkpAccessControlCondition(pkpAddress);

  const { litActionCode, litActionIpfsCid } = getLitActionCodeOrCidCommon(
    'batchGenerateEncryptedKeys'
  );

  const actionResults = await batchGenerateKeysWithLitAction({
    ...params,
    litClient,
    litActionIpfsCid: litActionCode ? undefined : litActionIpfsCid,
    litActionCode: litActionCode ? litActionCode : undefined,
    accessControlConditions: [allowPkpAddressToDecrypt],
    pkpSessionSigs,
  });

  const keyParamsBatch = actionResults.map((keyData) => {
    const { generateEncryptedPrivateKey, network } = keyData;
    return {
      ...generateEncryptedPrivateKey,
      keyType: getKeyTypeFromNetwork(network),
    };
  });

  const { ids } = await storePrivateKeyBatch({
    sessionSig,
    storedKeyMetadataBatch: keyParamsBatch,
    litNetwork: getLitNetworkFromClient(litClient),
  });

  const results = actionResults.map(
    (actionResult, ndx): BatchGeneratePrivateKeysActionResult => {
      const {
        generateEncryptedPrivateKey: { memo, publicKey },
      } = actionResult;
      const id = ids[ndx]; // Result of writes is in same order as provided

      const signature = actionResult.signMessage?.signature;

      return {
        ...(signature ? { signMessage: { signature } } : {}),
        generateEncryptedPrivateKey: {
          memo: memo,
          id,
          generatedPublicKey: publicKey,
          pkpAddress,
        },
      };
    }
  );

  return { pkpAddress, results };
}
