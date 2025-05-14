import { version } from '@lit-protocol/constants';
import { HexPrefixedSchema } from '@lit-protocol/schemas';
import { z } from 'zod';
import { LitNetworkModuleBase } from '../../../types';
import { networkConfig } from './naga-dev.config';
import { PricingContextSchema } from './pricing-manager/PricingContextSchema';
import { AuthContextSchema } from './session-manager/AuthContextSchema';
// import { createJitSessionSigs } from './session-manager/create-jit-session-sigs';
import {
  CallbackParams,
  createStateManager,
} from './state-manager/createStateManager';

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
        toSign: z.array(z.number()),
        authContext: AuthContextSchema,
        userMaxPrice: z.bigint().optional(),
      }),
      createRequest: async (params: {
        pricingContext: z.input<typeof PricingContextSchema>;
        authContext: z.input<typeof AuthContextSchema>;
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
        // const sessionSigs = await createJitSessionSigs({
        //   pricingContext,
        //   authContext,
        // });
      },
    },
  },
};

export type NagaDevStateManagerType = Awaited<
  ReturnType<typeof createStateManager>
>;

export type NagaDevModule = typeof nagaDevModule;
