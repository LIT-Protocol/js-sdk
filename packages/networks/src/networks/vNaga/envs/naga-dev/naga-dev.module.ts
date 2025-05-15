import { version } from '@lit-protocol/constants';
import { composeLitUrl, createRequestId } from '@lit-protocol/lit-node-client';
import {
  Bytes32Schema,
  HexPrefixedSchema,
  NodeSetsFromUrlsSchema,
} from '@lit-protocol/schemas';
import {
  createChainManager,
  type CreateChainManagerReturn,
} from '@nagaDev/ChainManager';
import { ConnectionInfo } from '@vNaga/LitChainClient';
import type { ExpectedAccountOrWalletClient } from '@vNaga/LitChainClient/contract-manager/createContractsManager';
import { z } from 'zod';
import { NormaliseArraySchema } from '../../../shared/utils/NormaliseArraySchema';
import { LitNetworkModuleBase } from '../../../types';
import { networkConfig } from './naga-dev.config';
import { PricingContextSchema } from './pricing-manager/PricingContextSchema';
import {
  AuthContext,
  AuthContextSchema,
} from './session-manager/AuthContextSchema';
import { createJitSessionSigs } from './session-manager/create-jit-session-sigs';
import {
  CallbackParams,
  createStateManager,
} from './state-manager/createStateManager';
import {
  ScopeSchemaRaw,
  ScopeString,
} from '@vNaga/LitChainClient/schemas/shared/ScopeSchema';

// Define the object first
const nagaDevModuleObject = {
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

  chainApi: {
    mintPkp: async ({
      authContext,
      scopes,
    }: {
      // TODO: EOA has ViemAccount as a property, has "any" for now.
      authContext: AuthContext | any;
      scopes: ('sign-anything' | 'personal-sign' | 'no-permissions')[];
    }) => {
      const chainManager = createChainManager(authContext.viemAccount);

      const mintPKP = await chainManager.api.mintPKP({
        scopes: scopes,
        authMethod: authContext.authMethod,
      });

      return mintPKP;
    },
  },
  api: {
    pkpSign: {
      schema: z.object({
        signingScheme: z.enum(['EcdsaK256Sha256', 'EcdsaK256Sha384']),
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
          toSign: any;
        };
        connectionInfo: ConnectionInfo;
        version: string;
      }) => {
        // -- 1. generate JIT session sigs
        const sessionSigs = await createJitSessionSigs({
          pricingContext: PricingContextSchema.parse(params.pricingContext),
          authContext: params.authContext,
        });

        // -- 2. generate requests
        const _requestId = createRequestId();
        const requests = [];

        const urls = Object.keys(sessionSigs);

        for (const url of urls) {
          const body = {
            toSign: Bytes32Schema.parse(params.signingContext.toSign),
            signingScheme: 'EcdsaK256Sha256',

            // ❗️ THIS FREAKING "pubkey"! "k" is lowercase!!
            pubkey: HexPrefixedSchema.parse(params.signingContext.pubKey),
            authSig: sessionSigs[url],
            nodeSet: NodeSetsFromUrlsSchema.parse(urls),
          };
          const urlWithPath = composeLitUrl({
            url,
            endpoint: nagaDevModuleObject.getEndpoints().PKP_SIGN,
          });
          requests.push({
            fullPath: urlWithPath,
            data: body,
            requestId: _requestId,
            epoch: params.connectionInfo.epochState.currentNumber,
            version: params.version,
          });
        }

        return requests;
      },
    },
  },
};

// Now define the type by taking the type of the object, but overriding getChainManager
export type NagaDevModule = Omit<
  typeof nagaDevModuleObject,
  'getChainManager'
> & {
  getChainManager: (
    accountOrWalletClient: ExpectedAccountOrWalletClient
  ) => CreateChainManagerReturn;
};

// Export the correctly typed object
export const nagaDevModule = nagaDevModuleObject as NagaDevModule;

export type NagaDevStateManagerType = Awaited<
  ReturnType<typeof createStateManager>
>;
