import { AUTH_METHOD_TYPE_VALUES, PRODUCT_IDS } from '@lit-protocol/constants';
import {
  AuthData,
  HexPrefixedSchema,
  NodeUrlsSchema,
  // SessionKeyUriSchema,
} from '@lit-protocol/schemas';
// import { AuthSig, LitResourceAbilityRequest, SessionKeyPair } from '@lit-protocol/types';
import { ethers } from 'ethers';
import { z } from 'zod';
import { AuthConfigV2 } from '../../authenticators/types';
import { AuthManagerParams } from '../auth-manager';
import { getPkpAuthContext } from '../authContexts/getPkpAuthContext';
import { processResources } from '../utils/processResources';
import { tryGetCachedAuthData } from '../try-getters/tryGetCachedAuthData';

export const PkpAuthDepsSchema = z.object({
  nonce: z.any(),
  currentEpoch: z.any(),
  getSignSessionKey: z.any(),
  nodeUrls: NodeUrlsSchema,
});

/**
 * Validates that the provided delegation auth sig hasn't expired and contains required resources
 */
// function validateDelegationAuthSig(
//   delegationAuthSig: AuthSig,
//   requiredResources: LitResourceAbilityRequest[],
//   sessionKeyUri: string
// ): void {
//   try {
//     // Parse the signed message to extract expiration and validate session key match
//     const siweMessage = delegationAuthSig.signedMessage;

//     // Check expiration
//     const expirationMatch = siweMessage.match(/^Expiration Time: (.*)$/m);
//     if (expirationMatch && expirationMatch[1]) {
//       const expiration = new Date(expirationMatch[1].trim());
//       if (expiration.getTime() <= Date.now()) {
//         throw new Error(`Delegation signature has expired at ${expiration.toISOString()}`);
//       }
//     }

//     // Validate session key URI matches
//     if (!siweMessage.includes(sessionKeyUri)) {
//       throw new Error('Session key URI in delegation signature does not match provided session key pair');
//     }

//     // TODO: Add resource validation - check if delegationAuthSig has required resources
//     // This would involve parsing the RECAP URN and checking against requiredResources

//   } catch (error) {
//     throw new Error(`Invalid delegation signature: ${error instanceof Error ? error.message : 'Unknown error'}`);
//   }
// }

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
    // Optional pre-generated auth materials
    // sessionKeyPair?: SessionKeyPair;
    // delegationAuthSig?: AuthSig;
  }
) {
  const _resources = processResources(params.authConfig.resources);

  // // Validate optional parameters
  // if ((params.sessionKeyPair && !params.delegationAuthSig) ||
  //     (!params.sessionKeyPair && params.delegationAuthSig)) {
  //   throw new Error('Both sessionKeyPair and delegationAuthSig must be provided together, or neither should be provided');
  // }

  // // If pre-generated auth materials are provided, validate and use them
  // if (params.sessionKeyPair && params.delegationAuthSig) {
  //   // Generate sessionKeyUri from the public key
  //   const sessionKeyUri = SessionKeyUriSchema.parse(params.sessionKeyPair.publicKey);

  //   // Validate the delegation signature
  //   validateDelegationAuthSig(
  //     params.delegationAuthSig,
  //     _resources,
  //     sessionKeyUri
  //   );

  //   // Return auth context using provided materials
  //   return {
  //     chain: 'ethereum',
  //     pkpPublicKey: params.pkpPublicKey,
  //     authData: params.authData,
  //     authConfig: {
  //       domain: params.authConfig.domain!,
  //       resources: _resources,
  //       capabilityAuthSigs: params.authConfig.capabilityAuthSigs!,
  //       expiration: params.authConfig.expiration!,
  //       statement: params.authConfig.statement!,
  //     },
  //     sessionKeyPair: {
  //       ...params.sessionKeyPair,
  //       sessionKeyUri, // Add the generated sessionKeyUri to match expected interface
  //     },
  //     // Provide the pre-generated delegation signature
  //     authNeededCallback: async () => params.delegationAuthSig!,
  //   };
  // }

  // Original logic for generating auth materials
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
