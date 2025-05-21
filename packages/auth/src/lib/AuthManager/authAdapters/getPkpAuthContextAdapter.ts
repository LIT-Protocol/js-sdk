import {
  HexPrefixedSchema,
  NodeUrlsSchema,
  AuthData,
} from '@lit-protocol/schemas';
import { ethers } from 'ethers';
import { z } from 'zod';
import { AuthConfigV2 } from '../../authenticators/types';
import { AuthManagerParams, tryGetCachedAuthData } from '../auth-manager';
import { getPkpAuthContext } from '../authContexts/getPkpAuthContext';
import { processResources } from '../utils/processResources';
import { PRODUCT_IDS } from '@lit-protocol/constants';
// // Define this near the top of the file or in a shared types file
// export interface AuthenticatorWithId {
//   new (config: any): any; // the constructor signature (maybe all the AuthConfigs eg. GoogleConfig?)
//   id: AuthMethodType; // Or potentially AuthMethodType if that's more specific
//   authenticate: Function; // Add this line
//   register?: Function; // Technically only needed for webauthn
// }

export const PkpAuthDepsSchema = z.object({
  nonce: z.any(),
  currentEpoch: z.any(),
  getSignSessionKey: z.any(),
  nodeUrls: NodeUrlsSchema,
});

export async function getPkpAuthContextAdapter(
  upstreamParams: AuthManagerParams,
  params: {
    authData: AuthData;
    pkpPublicKey: z.infer<typeof HexPrefixedSchema>;
    authConfig: AuthConfigV2;
    litClient: {
      getContext: () => Promise<any>;
    };
  }
) {
  const _resources = processResources(params.authConfig.resources);
  const litClientCtx = await params.litClient.getContext();

  const latestConnectionInfo = litClientCtx.latestConnectionInfo;
  // - boostrapUrls
  // - epochInfo
  // - epochState
  //   - currentNumber
  //   - startTime
  // - minNodeCount
  // - priceFeedInfo
  //   - epochId: bigint
  //   - minNodeCount: number
  //   - networkPrices: [{ url: string, price: bigint }]
  const nodePrices = latestConnectionInfo.priceFeedInfo.networkPrices;

  const handshakeResult = litClientCtx.handshakeResult;
  console.log('handshakeResult:', handshakeResult);
  const threshold = handshakeResult.threshold;

  const nodeUrls = litClientCtx.getMaxPricesForNodeProduct({
    nodePrices: nodePrices,
    userMaxPrice: litClientCtx.getUserMaxPrice({
      product: 'LIT_ACTION',
    }),
    productId: PRODUCT_IDS['LIT_ACTION'],
    numRequiredNodes: threshold,
  });

  console.log('nodeUrls:', nodeUrls);

  // const litClientConfig = PkpAuthDepsSchema.parse({
  //   nonce: litClientCtx.latestBlockhash,
  //   currentEpoch: litClientCtx.currentEpoch.epochState.currentNumber,

  //   // we need this in the network module
  //   getSignSessionKey: params.litClient.getSignSessionKey,
  //   // we need this in the network module
  //   nodeUrls: await params.litClient.getMaxPricesForNodeProduct({
  //     product: 'LIT_ACTION',
  //   }),
  // });

  // console.log('litClientConfig:', litClientConfig);

  const pkpAddress = ethers.utils.computeAddress(params.pkpPublicKey);

  // @example   {
  //   sessionKey: {
  //     keyPair: {
  //       publicKey: "bf8001bfdead23402d867d1acd965b45b405676a966db4237af11ba5eb85d7ce",
  //       secretKey: "9e19bd14bbc1bf4a6a0d08bd035d279702d31a6da159d52867441ae02e77ba02bf8001bfdead23402d867d1acd965b45b405676a966db4237af11ba5eb85d7ce",
  //     },
  //     expiresAt: "2025-05-02T16:06:19.195Z",
  //   },
  //   authMethodType: 1,
  // }
  const litAuthData = await tryGetCachedAuthData({
    storage: upstreamParams.storage,
    address: pkpAddress,
    expiration: params.authConfig.expiration,
    type: params.authData.authMethodType,
  });

  console.log('litAuthData:', litAuthData);

  return getPkpAuthContext({
    authentication: {
      pkpPublicKey: params.pkpPublicKey,
      authData: params.authData,
    },
    authConfig: {
      domain: params.authConfig.domain,
      resources: _resources,
      capabilityAuthSigs: params.authConfig.capabilityAuthSigs,
      expiration: params.authConfig.expiration,
      statement: params.authConfig.statement,
    },
    deps: {
      litAuthData: litAuthData,
      connection: {
        nonce: litClientCtx.latestBlockhash,
        currentEpoch:
          litClientCtx.latestConnectionInfo.epochState.currentNumber,
        nodeUrls: nodeUrls,
      },

      // Technically we don't need this as internally we should be able to use
      // networkModule.getSignSessionKey as authNeededCallback?
      nodeSignSessionKey: litClientCtx.getSignSessionKey,
    },
  });
}
