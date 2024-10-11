import { GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK } from '@lit-protocol/constants';
import { AccessControlConditions } from '@lit-protocol/types';

import { postLitActionValidation } from '../utils';
import { BatchGeneratePrivateKeysParams, Network } from '../../types';

import { LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';
import { LitAbility, LitResourceAbilityRequest } from '@lit-protocol/types';


interface BatchGeneratePrivateKeysWithLitActionParams
  extends BatchGeneratePrivateKeysParams {
  accessControlConditions: AccessControlConditions;
  litActionIpfsCid?: string;
  litActionCode?: string;
}

interface GeneratePrivateKeyLitActionResult {
  ciphertext: string;
  dataToEncryptHash: string;
  publicKey: string;
  memo: string;
}

interface BatchGeneratePrivateKeysWithLitActionResult {
  network: Network;
  signMessage?: { signature: string };
  generateEncryptedPrivateKey: GeneratePrivateKeyLitActionResult;
}

export async function triaBatchGenerateKeysWithLitActionSessionSigs(
  args: Omit<BatchGeneratePrivateKeysWithLitActionParams, 'pkpSessionSigs' | 'accessControlConditions'> & {
    authMethod: {
      accessToken: string | `eyJ${string}`;
      authMethodType: string | `0x${string}`;
    },
    publicKey: string;
  }
): Promise<BatchGeneratePrivateKeysWithLitActionResult[]> {

  // print all the params out
  // console.log("args:", args);
  // process.exit();

  const sessionSigs = await args.litNodeClient.getLitActionSessionSigs({
    pkpPublicKey: args.publicKey,
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
    litActionCode: args.litActionCode ?
      Buffer.from(args.litActionCode).toString('base64') :
      undefined,

    // @ts-ignore - this is a test
    litActionIpfsCid: args.litActionIpfsCid ?
      undefined :
      args.litActionIpfsCid,

    jsParams: {
      publicKey: args.publicKey,
      sigName: 'tria-batch-generate-keys-combined-sig',
      actions: args.actions,
      authMethod: {
        accessToken: args.authMethod.accessToken,
        authMethodType: args.authMethod.authMethodType,
      }
    }
  });

  console.log("sessionSigs:", sessionSigs);
  process.exit();

  // const result = await litNodeClient.executeJs({
  //   useSingleNode: true,
  //   sessionSigs: pkpSessionSigs,
  //   ipfsId: litActionIpfsCid,
  //   code: litActionCode,
  //   jsParams: {
  //     actions,
  //     accessControlConditions,
  //   },
  //   ipfsOptions: {
  //     overwriteCode:
  //       GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK[litNodeClient.config.litNetwork],
  //   },
  // });

  // const response = postLitActionValidation(result);
  // return JSON.parse(response);
}
