import { AUTH_METHOD_TYPE_VALUES, PRODUCT_IDS } from '@lit-protocol/constants';
import { getChildLogger } from '@lit-protocol/logger';
import {
  AuthData,
  HexPrefixedSchema,
  SessionKeyUriSchema,
} from '@lit-protocol/schemas';
import { AuthSig, SessionKeyPair } from '@lit-protocol/types';
import { ethers } from 'ethers';
import { z } from 'zod';
import { AuthConfigV2 } from '../../authenticators/types';
import { LitAuthData } from '../../types';
import { AuthManagerParams } from '../auth-manager';
import { getPkpAuthContext } from '../authContexts/getPkpAuthContext';
import { processResources } from '../utils/processResources';

const _logger = getChildLogger({
  module: 'generatePkpDelegationAuthSig',
});

/**
 * Generates a PKP delegation auth signature for a given session key pair.
 * The PKP will sign the session key delegation message via Lit nodes.
 * This function is useful for server-side scenarios where you want to pre-generate
 * PKP session materials and reuse them across multiple requests.
 *
 * @param upstreamParams - Auth manager parameters including storage
 * @param params - Parameters for generating the PKP delegation signature
 * @returns The delegation auth signature (AuthSig) signed by the PKP
 */
export async function generatePkpDelegationAuthSig(
  upstreamParams: AuthManagerParams,
  params: {
    pkpPublicKey: z.infer<typeof HexPrefixedSchema>;
    authData: AuthData;
    sessionKeyPair: SessionKeyPair;
    authConfig: AuthConfigV2;
    litClient: {
      getContext: () => Promise<any>;
    };
  }
): Promise<AuthSig> {
  _logger.info(
    {
      pkpPublicKey: params.pkpPublicKey,
      hasSessionKeyPair: !!params.sessionKeyPair,
    },
    'generatePkpDelegationAuthSig: Starting PKP delegation signature generation'
  );

  const _resources = processResources(params.authConfig.resources);

  // Get network context from litClient
  const litClientCtx = await params.litClient.getContext();
  const latestConnectionInfo = litClientCtx.latestConnectionInfo;
  const nodePrices = latestConnectionInfo.priceFeedInfo.networkPrices;
  const handshakeResult = litClientCtx.handshakeResult;
  const threshold = handshakeResult.threshold;

  const nodeUrls = litClientCtx.getMaxPricesForNodeProduct({
    nodePrices: nodePrices,
    userMaxPrice: litClientCtx.getUserMaxPrice({
      product: 'LIT_ACTION',
    }),
    productId: PRODUCT_IDS['LIT_ACTION'],
    numRequiredNodes: threshold,
  });

  const pkpAddress = ethers.utils.computeAddress(params.pkpPublicKey);

  // Create a minimal LitAuthData structure with the provided session key pair
  const litAuthData: LitAuthData = {
    sessionKey: {
      keyPair: params.sessionKeyPair,
      expiresAt: params.authConfig.expiration!,
    },
    authMethodType: params.authData.authMethodType as AUTH_METHOD_TYPE_VALUES,
  };

  // Call getPkpAuthContext which will generate the delegation signature
  const authContext = await getPkpAuthContext({
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
    // Disable caching since we're explicitly generating a new signature
    cache: {
      delegationAuthSig: false,
    },
  });

  // Get the delegation signature from the auth context
  const delegationAuthSig = await authContext.authNeededCallback();

  _logger.info(
    {
      pkpAddress,
      hasSignature: !!delegationAuthSig,
    },
    'generatePkpDelegationAuthSig: PKP delegation signature generated successfully'
  );

  return delegationAuthSig;
}
