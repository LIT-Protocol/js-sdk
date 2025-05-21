import { DOCS, version } from '@lit-protocol/constants';
import { AuthContextSchema, EoaAuthContextSchema } from '@lit-protocol/schemas';
import { Hex } from 'viem';

import { z } from 'zod';
import { LitNetworkModuleBase } from '../../../types';
import type { ExpectedAccountOrWalletClient } from '../../LitChainClient/contract-manager/createContractsManager';
import { networkConfig } from './naga-dev.config';
import { PricingContextSchema } from './pricing-manager/PricingContextSchema';
import { issueSessionFromContext } from './session-manager/issueSessionFromContext';
import { createStateManager } from './state-manager/createStateManager';

// Import the necessary types for the explicit return type annotation
import { getAuthIdByAuthMethod } from '@lit-protocol/auth';
import { AuthMethod, CallbackParams, RequestItem } from '@lit-protocol/types';
import { createRequestId } from '../../../shared/helpers/createRequestId';
import { handleAuthServiceRequest } from '../../../shared/helpers/handleAuthServiceRequest';
import { JobStatusResponse } from '../../../shared/helpers/pollResponse';
import { composeLitUrl } from '../../endpoints-manager/composeLitUrl';
import type { LitTxRes } from '../../LitChainClient/apis/types';
import type { PKPData } from '../../LitChainClient/schemas/shared/PKPDataSchema';
import { combinePKPSignSignatures } from './api-manager/helper/get-signatures';
import { PKPSignCreateRequestParams } from './api-manager/pkpSign/pkpSign.CreateRequestParams';
import {
  BitCoinPKPSignInputSchema,
  EthereumPKPSignInputSchema,
  PKPSignInputSchema,
} from './api-manager/pkpSign/pkpSign.InputSchema';
import { PKPSignRequestDataSchema } from './api-manager/pkpSign/pkpSign.RequestDataSchema';
import { PKPSignResponseDataSchema } from './api-manager/pkpSign/pkpSign.ResponseDataSchema';
import {
  createChainManager,
  CreateChainManagerReturn,
} from './chain-manager/createChainManager';

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
  getAuthServerBaseUrl: () => networkConfig.authServerBaseUrl,
  // composeLitUrl: composeLitUrl,
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

  // createAuthService: () => {
  //   const AUTH_SERVICE_URL = 'https://naga-auth-service.getlit.dev/';

  //   return {
  //     prepareMintPkpHttpRequest: (params: {
  //       authMethodId?: Hex;
  //       authMethodType?: number;
  //       pubkey?: Hex;
  //       customAuthMethodId?: string;
  //     }) => {
  //       return params;
  //     },
  //   };
  // },
  chainApi: {
    /**
     * Mints a PKP using the provided authentication context and optional parameters.
     *
     * @param params - The parameters for minting a PKP.
     * @param params.authContext - The authentication context (E.g., EOA wallet and its authMethod).
     * @param params.scopes - The permission scopes for the PKP.
     * Note: The values within `overwrites` allow for fine-grained control. The underlying `MintPKPSchema`
     * handles the precise precedence: direct inputs in `overwrites` > `customAuthMethodId` in `overwrites` > values derived from `authContext.authMethod`.
     */
    mintPkp: async (params: {
      authContext:
        | z.infer<typeof AuthContextSchema>
        | z.infer<typeof EoaAuthContextSchema>;
      scopes: ('sign-anything' | 'personal-sign' | 'no-permissions')[];

      /**
       * @deprecated - TODO: This is usually used by the external auth service to mint a PKP,
       * such as the PKP Auth Service (Previously known as the Relayer). Perhaps we want to move this to a separate function? eg. [networkModule].authService.mintPkp
       */
      overwrites?: {
        authMethodId?: Hex;
        authMethodType?: number;
        pubkey?: Hex;
        customAuthMethodId?: string;
      };
    }): Promise<LitTxRes<PKPData>> => {
      // ========== This is EoaAuthContextSchema ==========
      if ('account' in params.authContext && params.authContext.account) {
        const { account, authMethod } = params.authContext;

        const chainManager = createChainManager(account);

        return await chainManager.api.mintPKP({
          scopes: params.scopes,
          authMethod: authMethod,
          authMethodId: params.overwrites?.authMethodId,
          authMethodType: params.overwrites?.authMethodType,
          pubkey: params.overwrites?.pubkey,
          customAuthMethodId: params.overwrites?.customAuthMethodId,
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
  authService: {
    pkpMint: async (params: {
      authMethod: AuthMethod;
      authServerBaseUrl?: string;
    }) => {
      const _serverUrl =
        networkConfig.authServerBaseUrl || params.authServerBaseUrl;
      const _authMethodType = params.authMethod.authMethodType;
      const _authMethodId = await getAuthIdByAuthMethod(params.authMethod);

      const res = await handleAuthServiceRequest({
        jobName: 'PKP Minting',
        serverUrl: _serverUrl!,
        path: '/pkp/mint',
        body: {
          authMethodType: _authMethodType,
          authMethodId: _authMethodId,
        },
      });

      return res as unknown as Promise<{
        _raw: JobStatusResponse;
        txHash: string;
        data: PKPData;
      }>;
    },
  },
  api: {
    pkpSign: {
      schemas: {
        Input: {
          raw: PKPSignInputSchema,
          ethereum: EthereumPKPSignInputSchema,
          bitcoin: BitCoinPKPSignInputSchema,
        },
        RequestData: PKPSignRequestDataSchema,
        ResponseData: PKPSignResponseDataSchema,
      },
      createRequest: async (params: PKPSignCreateRequestParams) => {
        // -- 1. generate session sigs
        const sessionSigs = await issueSessionFromContext({
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

            // additional meta to determine hash function, but not
            // sent to the node
            chain: params.chain,
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
        // console.log('Incoming result for pkpSign handleResponse:', result);

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
