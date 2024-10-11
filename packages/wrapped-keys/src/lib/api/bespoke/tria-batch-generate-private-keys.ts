import { getKeyTypeFromNetwork } from '../utils';
import { batchGenerateKeysWithLitAction } from '../../lit-actions-client';
import { getLitActionCodeOrCidCommon } from '../../lit-actions-client/utils';
import { storePrivateKey } from '../../service-client';
import {
  BatchGeneratePrivateKeysActionResult,
  BatchGeneratePrivateKeysParams,
  BatchGeneratePrivateKeysResult,
} from '../../types';
import {
  getFirstSessionSig,
  getPkpAccessControlCondition,
  getPkpAddressFromSessionSig,
} from '../../utils';
import { triaBatchGenerateKeysWithLitActionSessionSigs } from '../../lit-actions-client/bespoke/tria-batch-generate-keys';
import { AccessControlConditions } from '@lit-protocol/types';

const CACHE_KEY = 'tria_batchGenerateEncryptedKeys';

type TriaBatchGeneratePrivateKeysParams =
  Omit<BatchGeneratePrivateKeysParams, 'pkpSessionSigs'> & {
    authMethod: {
      accessToken: string | `eyJ${string}`;
      authMethodType: string | `0x${string}`;
    },
    publicKey: string;
    // accessControlConditions: AccessControlConditions
  };

/**
 * @link ../batch-generate-private-keys.ts
 */
export async function triaBatchGeneratePrivateKeys(
  params: TriaBatchGeneratePrivateKeysParams
): Promise<BatchGeneratePrivateKeysResult> {
  const {
    // pkpSessionSigs, 
    litNodeClient } = params;

  // const sessionSig = getFirstSessionSig(pkpSessionSigs);
  // const pkpAddress = getPkpAddressFromSessionSig(sessionSig);

  // const allowPkpAddressToDecrypt = getPkpAccessControlCondition(pkpAddress);

  const { litActionCode, litActionIpfsCid } =
    getLitActionCodeOrCidCommon(CACHE_KEY);

  const actionResults = await triaBatchGenerateKeysWithLitActionSessionSigs({
    ...params,
    litActionIpfsCid: litActionCode ? undefined : litActionIpfsCid,
    litActionCode: litActionCode ? litActionCode : undefined,
    // accessControlConditions: undefined,
    // pkpSessionSigs,
  });

  // const results = await Promise.all(
  //   actionResults.map(
  //     async (result): Promise<BatchGeneratePrivateKeysActionResult> => {
  //       const { generateEncryptedPrivateKey, network } = result;

  //       const signature = result.signMessage?.signature;

  //       const { id } = await storePrivateKey({
  //         sessionSig,
  //         storedKeyMetadata: {
  //           ...generateEncryptedPrivateKey,
  //           keyType: getKeyTypeFromNetwork(network),
  //           pkpAddress,
  //         },
  //         litNetwork: litNodeClient.config.litNetwork,
  //       });

  //       return {
  //         ...(signature ? { signMessage: { signature } } : {}),
  //         generateEncryptedPrivateKey: {
  //           memo: generateEncryptedPrivateKey.memo,
  //           id,
  //           generatedPublicKey: generateEncryptedPrivateKey.publicKey,
  //           pkpAddress,
  //         },
  //       };
  //     }
  //   )
  // );

  return { pkpAddress: null as any, results: null as any };
}
