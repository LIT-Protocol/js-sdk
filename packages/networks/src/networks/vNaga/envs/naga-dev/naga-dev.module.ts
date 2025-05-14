import { version } from '@lit-protocol/constants';
import {
  Bytes32Schema,
  HexPrefixedSchema,
  NodeSetSchema,
  NodeSetsFromUrlsSchema,
} from '@lit-protocol/schemas';
import { z } from 'zod';
import { LitNetworkModuleBase } from '../../../types';
import { networkConfig } from './naga-dev.config';
import { PricingContextSchema } from './pricing-manager/PricingContextSchema';
import { AuthContextSchema } from './session-manager/AuthContextSchema';
import { createJitSessionSigs } from './session-manager/create-jit-session-sigs';
import {
  CallbackParams,
  createStateManager,
} from './state-manager/createStateManager';
import { composeLitUrl, createRequestId } from '@lit-protocol/lit-node-client';

export const nagaDevModule = {
  id: 'naga',
  version: `${version}-naga-dev`,
  config: {
    requiredAttestation: false,
    abortTimeout: 20_000,
    minimumThreshold: networkConfig.minimumThreshold,
  },
  getNetworkName: () => networkConfig.network,
  getHttpProtocol: () => networkConfig.httpProtocol,
  getEndpoints: () => networkConfig.endpoints,
  getRpcUrl: () => networkConfig.rpcUrl,
  getChainConfig: () => networkConfig.chainConfig,

  // main responsiblities:
  // - return latestBlockhash
  // - listens for StateChange events and updates the connection info
  // - orchestrate handshake via callback
  getStateManager: async <T, M>(params: {
    callback: (params: CallbackParams) => Promise<T>;
    networkModule: M;
  }): Promise<Awaited<ReturnType<typeof createStateManager<T>>>> => {
    return await createStateManager<T>({
      networkConfig,
      callback: params.callback,
      networkModule: params.networkModule as LitNetworkModuleBase,
    });
  },

  api: {
    pkpSign: {
      schema: z.object({
        pubKey: HexPrefixedSchema,
        toSign: z.any(),
        authContext: AuthContextSchema,
        userMaxPrice: z.bigint().optional(),
      }),
      createRequest: async (params: {
        pricingContext: z.input<typeof PricingContextSchema>;
        authContext: z.input<typeof AuthContextSchema>;
        signingContext: {
          pubKey: z.infer<typeof HexPrefixedSchema>;
          toSign: z.infer<typeof Bytes32Schema>;
        };
        // latestBlockhash: string;
      }) => {
        //1. Pricing Context
        // Pricing context properties:
        // - product { id: bigint, name: string }
        // - userMaxPrice { bigint }
        // - nodePrices { url: string, prices: bigint[] }[]
        // - threshold { number }
        const pricingContext = PricingContextSchema.parse(
          params.pricingContext
        );
        console.log('pricingContext', pricingContext);

        //  2. Auth Context
        // Auth context properties:
        // - pkpPublicKey { string }
        // - chain: { string }
        // - resourceAbilityRequests: { resource, ability }[]
        // - sessionKeyPair { publicKey, secretKey }
        // - authNeededCallback
        // - capabilityAuthSigs
        const authContext = params.authContext;
        console.log('authContext:', authContext);

        // 3. Generate JIT session sigs
        const sessionSigs = await createJitSessionSigs({
          pricingContext,
          authContext,
          // latestBlockhash: params.latestBlockhash,
        });

        // 4. Generate requests
        const _requestId = createRequestId();
        const requests = [];

        const urls = Object.keys(sessionSigs);
        for (const url of urls) {
          const sessionAuthSig = sessionSigs[url];
          const body = {
            toSign: params.signingContext.toSign,
            pubKey: params.signingContext.pubKey,
            authSig: sessionAuthSig,
            nodeSet: NodeSetsFromUrlsSchema.parse(urls),
            signingScheme: 'EcdsaK256Sha256',
          };
          const urlWithPath = composeLitUrl({
            url,
            endpoint: nagaDevModule.getEndpoints().PKP_SIGN,
          });
          requests.push({
            id: _requestId,
            url: urlWithPath,
            body,
          });
        }

        return requests;
      },
    },
  },
};

export type NagaDevStateManagerType = Awaited<
  ReturnType<typeof createStateManager>
>;

export type NagaDevModule = typeof nagaDevModule;
