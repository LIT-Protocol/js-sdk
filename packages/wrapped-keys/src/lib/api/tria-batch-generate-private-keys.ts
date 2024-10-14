import {
  getFirstSessionSig,
  getKeyTypeFromNetwork,
  getPkpAccessControlCondition,
  getPkpAddressFromSessionSig,
} from './utils';
import { batchGenerateKeysWithLitAction } from '../lit-actions-client';
import { getLitActionCodeOrCidCommon } from '../lit-actions-client/utils';
import { LitAbility, LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';
import { storePrivateKeyBatch } from '../service-client';
import {
  BatchGeneratePrivateKeysActionResult,
  BatchGeneratePrivateKeysParams,
  BatchGeneratePrivateKeysResult,
} from '../types';
import { computeAddress } from 'ethers/lib/utils';
import { SessionSigsMap } from '@lit-protocol/types';

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

  if (!params.litNodeClient) {
    throw new Error(`Error: litNodeClient is required`);
  }
  if (!params.pkpPublicKey) {
    throw new Error(`Error: pkpPublicKey is required`);
  }
  if (!params.ipfsId) {
    throw new Error(`Error: ipfsId is required`);
  }

  let pkpPubKey = params.pkpPublicKey;

  if (pkpPubKey.startsWith('0x')) {
    pkpPubKey = pkpPubKey.slice(2);
  }

  const pkpPubkeyBuffer = Buffer.from(pkpPubKey, 'hex');
  const pkpEthAddress = computeAddress(pkpPubkeyBuffer);
  const allowPkpAddressToDecrypt = getPkpAccessControlCondition(pkpEthAddress);

  let litActionSessionSigs: SessionSigsMap;

  const _jsParams = {
    triaParams: {
      authMethod: {
        accessToken: params.authMethod.accessToken,
        authMethodType: params.authMethod.authMethodType,
      },
      publicKey: pkpPubKey,
    },
    actions: params.actions,
    accessControlConditions: [allowPkpAddressToDecrypt],
  };

  // const { pkpSessionSigs, litNodeClient } = params;

  // const sessionSig = getFirstSessionSig(pkpSessionSigs);
  // const pkpAddress = getPkpAddressFromSessionSig(sessionSig);

  // const allowPkpAddressToDecrypt = getPkpAccessControlCondition(pkpAddress);

  // const { litActionCode, litActionIpfsCid } = getLitActionCodeOrCidCommon(
  //   'batchGenerateEncryptedKeys'
  // );

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
      handleAllResponses: true,
    });
  } catch (e) {
    throw new Error(`Error getting Lit Action Session Sigs: ${e}`);
  }

  console.log("litActionSessionSigs:", litActionSessionSigs);

  process.exit();

  return { pkpAddress: pkpEthAddress, results: [] };

  // TODO: Uncomment below
  // const keyParamsBatch = actionResults.map((keyData) => {
  //   const { generateEncryptedPrivateKey, network } = keyData;
  //   return {
  //     ...generateEncryptedPrivateKey,
  //     keyType: getKeyTypeFromNetwork(network),
  //   };
  // });

  // const { ids } = await storePrivateKeyBatch({
  //   sessionSig,
  //   storedKeyMetadataBatch: keyParamsBatch,
  //   litNetwork: litNodeClient.config.litNetwork,
  // });

  // const results = actionResults.map(
  //   (actionResult, ndx): BatchGeneratePrivateKeysActionResult => {
  //     const {
  //       generateEncryptedPrivateKey: { memo, publicKey },
  //     } = actionResult;
  //     const id = ids[ndx]; // Result of writes is in same order as provided

  //     const signature = actionResult.signMessage?.signature;

  //     return {
  //       ...(signature ? { signMessage: { signature } } : {}),
  //       generateEncryptedPrivateKey: {
  //         memo: memo,
  //         id,
  //         generatedPublicKey: publicKey,
  //         pkpAddress,
  //       },
  //     };
  //   }
  // );

  // return { pkpAddress, results };
}
