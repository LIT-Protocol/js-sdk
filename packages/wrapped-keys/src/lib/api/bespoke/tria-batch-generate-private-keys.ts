import { getKeyTypeFromNetwork } from './../utils';
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
import { LitAbility, LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';
import { SessionSigsMap } from '@lit-protocol/types';
import { formatSessionSigsJSON, getResourcesFromSessionSigs } from '@lit-protocol/misc';
import { computeAddress } from 'ethers/lib/utils';


/**
 *  TODO: Document batch behaviour
 * @param { BatchGeneratePrivateKeysParams } params Parameters to use for generating keys and optionally signing messages
 *
 * @returns { Promise<BatchGeneratePrivateKeysResult> } - The generated keys and, optionally, signed messages
 */
export async function triaBatchGeneratePrivateKeys(
  params: Omit<BatchGeneratePrivateKeysParams, 'pkpSessionSigs'> & {
    pkpPublicKey: string | `0x${string}`;
    ipfsId: string | `Qm${string}`;
    authMethod: {
      authMethodType: string | `0x${string}`;
      accessToken: string | `eyJ${string}`;
    }
  }
): Promise<BatchGeneratePrivateKeysResult> {

  // -- validate
  if (!params.litNodeClient) {
    throw new Error(`Error: litNodeClient is required`);
  }
  if (!params.pkpPublicKey) {
    throw new Error(`Error: pkpPublicKey is required`);
  }
  if (!params.ipfsId) {
    throw new Error(`Error: ipfsId is required`);
  }

  // const sessionSig = getFirstSessionSig(pkpSessionSigs);
  // const pkpAddress = getPkpAddressFromSessionSig(sessionSig);

  // const allowPkpAddressToDecrypt = getPkpAccessControlCondition(pkpAddress);

  // const { litActionCode, litActionIpfsCid } = getLitActionCodeOrCidCommon(
  //   'tria_batchGenerateEncryptedKeys'
  // );

  let pkpPubKey = params.pkpPublicKey;

  if (pkpPubKey.startsWith('0x')) {
    pkpPubKey = pkpPubKey.slice(2);
  }
  const pkpPubkeyBuffer = Buffer.from(pkpPubKey, 'hex');

  const pkpEthAddress = computeAddress(pkpPubkeyBuffer);

  console.log("pkpEthAddress:", pkpEthAddress);

  const allowPkpAddressToDecrypt = getPkpAccessControlCondition(pkpEthAddress);

  // Here we should use getLitActionSessionSigs rather than executeJs
  console.log(`🔄 Getting Lit Action Session Sigs`);
  let litActionSessionSigs: SessionSigsMap;

  const _jsParams = {
    authMethod: {
      accessToken: params.authMethod.accessToken,
      authMethodType: params.authMethod.authMethodType,
    },
    actions: params.actions,
    publicKey: params.pkpPublicKey,
    accessControlConditions: [allowPkpAddressToDecrypt],
  };

  console.log("_jsParams:", _jsParams);

  try {
    litActionSessionSigs = await params.litNodeClient.getLitActionSessionSigs({
      pkpPublicKey: params.pkpPublicKey,
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource('*'),
          ability: LitAbility.PKPSigning,
        },
        {
          resource: new LitActionResource('*'),
          ability: LitAbility.LitActionExecution,
        },
      ],
      litActionIpfsId: params.ipfsId,
      jsParams: _jsParams,
    });
  } catch (e) {
    throw new Error(`Error getting Lit Action Session Sigs: ${e}`);
  }

  console.log("litActionSessionSigs:", litActionSessionSigs);

  const sessionSigsResources = getResourcesFromSessionSigs(JSON.stringify(litActionSessionSigs));

  console.log("sessionSigsResources:", sessionSigsResources);

  process.exit();

  // // This is the original code
  // const actionResults = await batchGenerateKeysWithLitAction({
  //   ...params,
  //   litActionIpfsCid: litActionCode ? undefined : litActionIpfsCid,
  //   litActionCode: litActionCode ? litActionCode : undefined,
  //   accessControlConditions: [allowPkpAddressToDecrypt],
  //   pkpSessionSigs,
  // });

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

  // return { pkpAddress, results };

  return { pkpAddress: '', results: [] };
}
