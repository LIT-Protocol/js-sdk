import { AUTH_METHOD_TYPE_VALUES, PRODUCT_IDS } from '@lit-protocol/constants';
import { getChildLogger } from '@lit-protocol/logger';
import {
  AuthData,
  HexPrefixedSchema,
  NodeUrlsSchema,
  SessionKeyUriSchema,
} from '@lit-protocol/schemas';
import { AuthSig, SessionKeyPair } from '@lit-protocol/types';
import { ethers } from 'ethers';
import { z } from 'zod';
import { AuthConfigV2 } from '../../authenticators/types';
import { AuthManagerParams } from '../auth-manager';
import { getPkpAuthContext } from '../authContexts/getPkpAuthContext';
import { processResources } from '../utils/processResources';
import { validateDelegationAuthSig } from '../utils/validateDelegationAuthSig';
import { tryGetCachedAuthData } from '../try-getters/tryGetCachedAuthData';

const _logger = getChildLogger({
  module: 'getPkpAuthContextAdapter',
});

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
    cache?: {
      delegationAuthSig?: boolean;
    };
    // Optional pre-generated auth materials for server-side usage
    sessionKeyPair?: SessionKeyPair;
    delegationAuthSig?: AuthSig;
  }
) {
  const _resources = processResources(params.authConfig.resources);

  // Validate optional parameters
  if (
    (params.sessionKeyPair && !params.delegationAuthSig) ||
    (!params.sessionKeyPair && params.delegationAuthSig)
  ) {
    throw new Error(
      'Both sessionKeyPair and delegationAuthSig must be provided together, or neither should be provided'
    );
  }

  // If pre-generated auth materials are provided, validate and use them
  if (params.sessionKeyPair && params.delegationAuthSig) {
    _logger.info(
      {
        hasSessionKeyPair: true,
        hasDelegationAuthSig: true,
      },
      'getPkpAuthContextAdapter: Using pre-generated session materials'
    );

    // Generate sessionKeyUri from the public key
    const sessionKeyUri = SessionKeyUriSchema.parse(
      'lit:session:' + params.sessionKeyPair.publicKey
    );

    // Validate the delegation signature
    validateDelegationAuthSig({
      delegationAuthSig: params.delegationAuthSig,
      sessionKeyUri,
    });

    // Return auth context using provided materials
    return {
      chain: 'ethereum',
      pkpPublicKey: params.pkpPublicKey,
      authData: params.authData,
      authConfig: {
        domain: params.authConfig.domain!,
        resources: _resources,
        capabilityAuthSigs: params.authConfig.capabilityAuthSigs!,
        expiration: params.authConfig.expiration!,
        statement: params.authConfig.statement!,
      },
      sessionKeyPair: params.sessionKeyPair,
      // Provide the pre-generated delegation signature
      authNeededCallback: async () => {
        _logger.debug(
          'getPkpAuthContextAdapter: Returning pre-generated delegation signature'
        );
        return params.delegationAuthSig!;
      },
    };
  }

  // Original logic for generating auth materials
  // TODO: 👇 The plan is to identify whether certain operations can be wrapped inside a single function
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
  const respondingUrlSet = new Set(Object.keys(handshakeResult.serverKeys));
  const respondingNodePrices = nodePrices.filter((item: { url: string }) =>
    respondingUrlSet.has(item.url)
  );

  if (respondingNodePrices.length < threshold) {
    throw new Error(
      `Not enough handshake nodes to satisfy threshold. Threshold: ${threshold}, responding nodes: ${respondingNodePrices.length}`
    );
  }

  const nodeUrls = litClientCtx.getMaxPricesForNodeProduct({
    nodePrices: respondingNodePrices,
    userMaxPrice: litClientCtx.getUserMaxPrice({
      product: 'SIGN_SESSION_KEY',
    }),
    productId: PRODUCT_IDS['SIGN_SESSION_KEY'],
    numRequiredNodes: threshold,
  });

  const pkpAddress = ethers.utils.computeAddress(params.pkpPublicKey);

  const litAuthData = await tryGetCachedAuthData({
    storage: upstreamParams.storage,
    address: pkpAddress,
    expiration: params.authConfig.expiration,
    type: params.authData.authMethodType as AUTH_METHOD_TYPE_VALUES,
  });

  return getPkpAuthContext({
    authentication: {
      pkpPublicKey: params.pkpPublicKey,
      authData: params.authData,
    },
    authConfig: {
      domain: params.authConfig.domain!,
      resources: _resources,
      capabilityAuthSigs: params.authConfig.capabilityAuthSigs!,
      expiration: params.authConfig.expiration!,
      statement: params.authConfig.statement!,
    },
    deps: {
      litAuthData: litAuthData,
      connection: {
        nonce: litClientCtx.latestBlockhash,
        currentEpoch:
          litClientCtx.latestConnectionInfo.epochState.currentNumber,
        nodeUrls: nodeUrls,
      },
      signSessionKey: litClientCtx.signSessionKey,
      storage: upstreamParams.storage,
      pkpAddress: pkpAddress,
    },
    cache: params.cache,
  });
}
