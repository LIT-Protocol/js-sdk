import { AUTH_METHOD_TYPE_VALUES, PRODUCT_IDS } from '@lit-protocol/constants';
import {
  AuthData,
  HexPrefixedSchema,
  NodeUrlsSchema,
} from '@lit-protocol/schemas';
import { ethers } from 'ethers';
import { z } from 'zod';
import { AuthConfigV2 } from '../../authenticators/types';
import { AuthManagerParams } from '../auth-manager';
import { getCustomAuthContext } from '../authContexts/getCustomAuthContext';
import { processResources } from '../utils/processResources';
import { tryGetCachedAuthData } from '../try-getters/tryGetCachedAuthData';

export const CustomAuthDepsSchema = z.object({
  nonce: z.any(),
  currentEpoch: z.any(),
  getSignSessionKey: z.any(),
  nodeUrls: NodeUrlsSchema,
});

export async function getCustomAuthContextAdapter(
  upstreamParams: AuthManagerParams,
  params: {
    // authData: AuthData;
    pkpPublicKey: z.infer<typeof HexPrefixedSchema>;
    authConfig: AuthConfigV2;
    litClient: {
      getContext: () => Promise<any>;
    };
    customAuthParams: {
      litActionCode?: string;
      litActionIpfsId?: string;
      jsParams?: Record<string, any>;
    };
  }
) {
  const _resources = processResources(params.authConfig.resources);

  // TODO: 👇 The plan is to identify if the certain operations could be wrapped inside a single function
  // where different network modules can provide their own implementations.

  // TODO: ❗️THIS IS NOT TYPED - we have to fix this!
  const litClientCtx = await params.litClient.getContext();

  // TODO: ❗️THIS IS NOT TYPED - we have to fix this! (This can be in both Naga and Datil)
  const latestConnectionInfo = litClientCtx.latestConnectionInfo;

  // TODO: ❗️THIS IS NOT TYPED - we have to fix this! (This can only be in Naga)
  const nodePrices = latestConnectionInfo.priceFeedInfo.networkPrices;

  // TODO: ❗️THIS IS NOT TYPED - we have to fix this! (This can be in both Naga and Datil)
  const handshakeResult = litClientCtx.handshakeResult;

  // TODO: ❗️THIS IS NOT TYPED - we have to fix this! (This can be in both Naga and Datil)
  const threshold = handshakeResult.threshold;

  // TODO: ❗️THIS IS NOT TYPED - we have to fix this! (This can only be in Naga)
  const nodeUrls = litClientCtx.getMaxPricesForNodeProduct({
    nodePrices: nodePrices,
    userMaxPrice: litClientCtx.getUserMaxPrice({
      product: 'LIT_ACTION',
    }),
    productId: PRODUCT_IDS['LIT_ACTION'],
    numRequiredNodes: threshold,
  });

  const pkpAddress = ethers.utils.computeAddress(params.pkpPublicKey);

  const litAuthData = await tryGetCachedAuthData({
    storage: upstreamParams.storage,
    address: pkpAddress,
    expiration: params.authConfig.expiration!,
    type: 'custom' as unknown as AUTH_METHOD_TYPE_VALUES,
  });

  return getCustomAuthContext({
    authentication: {
      pkpPublicKey: params.pkpPublicKey,
      // authData: {} as any,
    },
    authConfig: {
      domain: params.authConfig.domain!,
      resources: _resources,
      capabilityAuthSigs: params.authConfig.capabilityAuthSigs!,
      expiration: params.authConfig.expiration!,
      statement: params.authConfig.statement!,
    },
    customParams: {
      litActionCode: params.customAuthParams.litActionCode,
      litActionIpfsId: params.customAuthParams.litActionIpfsId,
      jsParams: params.customAuthParams.jsParams,
    },
    deps: {
      litAuthData: litAuthData,
      connection: {
        nonce: litClientCtx.latestBlockhash,
        currentEpoch:
          litClientCtx.latestConnectionInfo.epochState.currentNumber,
        nodeUrls: nodeUrls,
      },
      signCustomSessionKey: litClientCtx.signCustomSessionKey,
      storage: upstreamParams.storage,
      pkpAddress: pkpAddress,
    },
  });
}
