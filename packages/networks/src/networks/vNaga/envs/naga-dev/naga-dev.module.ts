import { DOCS, version } from '@lit-protocol/constants';
import { composeLitUrl, createRequestId } from '@lit-protocol/lit-node-client';
import { AuthContextSchema, EoaAuthContextSchema } from '@lit-protocol/schemas';
import {
  createChainManager,
  type CreateChainManagerReturn,
} from '@nagaDev/ChainManager';
import type { ExpectedAccountOrWalletClient } from '@vNaga/LitChainClient/contract-manager/createContractsManager';
import { z } from 'zod';
import { LitNetworkModuleBase } from '../../../types';
import { networkConfig } from './naga-dev.config';
import { PricingContextSchema } from './pricing-manager/PricingContextSchema';
import { createJitSessionSigs } from './session-manager/create-jit-session-sigs';
import {
  CallbackParams,
  createStateManager,
} from './state-manager/createStateManager';

// Import the necessary types for the explicit return type annotation
import { RequestItem } from '@lit-protocol/types';
import type { LitTxRes } from '../../LitChainClient/apis/types';
import type { PKPData } from '../../LitChainClient/schemas/shared/PKPDataSchema';
import { combinePKPSignSignatures } from './api-manager/helper/get-signatures';
import { PKPSignCreateRequestParams } from './api-manager/pkpSign/pkpSign.CreateRequestParams';
import { PKPSignInputSchema } from './api-manager/pkpSign/pkpSign.InputSchema';
import { PKPSignRequestDataSchema } from './api-manager/pkpSign/pkpSign.RequestDataSchema';
import { PKPSignResponseDataSchema } from './api-manager/pkpSign/pkpSign.ResponseDataSchema';

// Define ProcessedBatchResult type (mirroring structure from dispatchRequests)
type ProcessedBatchResult<T> =
  | { success: true; values: T[] }
  | { success: false; error: any; failedNodeUrls?: string[] };

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

  /**
   * 🧠 This is the core function that keeps all the network essential information
   * up to data, such as:
   * - latest blockhash
   * - connection info (node urls, epoch, etc.) - it listens for StateChange events
   * - orchestrate handshake via callback
   */
  createStateManager: async <T, M>(params: {
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
    mintPkp: async (params: {
      authContext:
        | z.infer<typeof AuthContextSchema>
        | z.infer<typeof EoaAuthContextSchema>;
      scopes: ('sign-anything' | 'personal-sign' | 'no-permissions')[];
    }): Promise<LitTxRes<PKPData>> => {
      // ========== This is EoaAuthContextSchema ==========
      if (
        'viemAccount' in params.authContext &&
        params.authContext.viemAccount
      ) {
        const { viemAccount, authMethod } = params.authContext;

        const chainManager = createChainManager(viemAccount);

        return await chainManager.api.mintPKP({
          scopes: params.scopes,
          authMethod: authMethod,
        });
      }

      // ========== This is AuthContextSchema ==========
      else if (
        'authConfig' in params.authContext &&
        params.authContext.authConfig &&
        'sessionKeyPair' in params.authContext
      ) {
        // This is AuthContextSchema
        throw new Error(DOCS.WHAT_IS_AUTH_CONTEXT);
      } else {
        throw new Error(
          'Invalid authContext provided: does not conform to EoaAuthContextSchema or AuthContextSchema properly.'
        );
      }
    },
  },
  api: {
    pkpSign: {
      schemas: {
        Input: PKPSignInputSchema,
        RequestData: PKPSignRequestDataSchema,
        ResponseData: PKPSignResponseDataSchema,
      },
      createRequest: async (params: PKPSignCreateRequestParams) => {
        // -- 1. generate JIT session sigs
        const sessionSigs = await createJitSessionSigs({
          pricingContext: PricingContextSchema.parse(params.pricingContext),
          authContext: params.authContext,
        });

        // -- 2. generate requests
        const _requestId = createRequestId();
        const requests: RequestItem<
          z.infer<typeof PKPSignRequestDataSchema>
        >[] = [];

        const urls = Object.keys(sessionSigs);

        for (const url of urls) {
          const _requestData = PKPSignRequestDataSchema.parse({
            toSign: params.signingContext.toSign,
            signingScheme: params.signingContext.signingScheme,
            pubkey: params.signingContext.pubKey,
            authSig: sessionSigs[url],
            nodeSet: urls,
          });

          const _urlWithPath = composeLitUrl({
            url,
            endpoint: nagaDevModuleObject.getEndpoints().PKP_SIGN,
          });

          requests.push({
            fullPath: _urlWithPath,
            data: _requestData,
            requestId: _requestId,
            epoch: params.connectionInfo.epochState.currentNumber,
            version: params.version,
          });
        }

        if (!requests || requests.length === 0) {
          console.error('No requests generated for pkpSign.');
          throw new Error('Failed to generate requests for pkpSign.');
        }

        return requests;
      },
      handleResponse: async (
        result: ProcessedBatchResult<z.infer<typeof PKPSignResponseDataSchema>>,
        requestId: string
      ) => {
        console.log('Incoming result for pkpSign handleResponse:', result);

        if (!result.success) {
          console.error(
            '🚨 PKP Sign batch failed in handleResponse:',
            result.error
          );
          throw Error(result.error);
        }

        const { values } = PKPSignResponseDataSchema.parse(result);

        const signatures = await combinePKPSignSignatures({
          nodesPkpSignResponseData: values,
          requestId,
          threshold: networkConfig.minimumThreshold,
        });

        console.log('signatures combined in handleResponse:', signatures);

        return signatures;
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
