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
import type { ExpectedAccountOrWalletClient } from '@vNaga/LitChainClient/contract-manager/createContractsManager';
import { z } from 'zod';
import { LitNetworkModuleBase } from '../../../types';
import { networkConfig } from './naga-dev.config';
import { PricingContextSchema } from './pricing-manager/PricingContextSchema';
import {
  AuthContextSchema,
  EoaAuthContextSchema,
} from './session-manager/AuthContextSchema';
import { createJitSessionSigs } from './session-manager/create-jit-session-sigs';
import {
  CallbackParams,
  createStateManager,
} from './state-manager/createStateManager';

// Import the necessary types for the explicit return type annotation
import type { LitTxRes } from '../../LitChainClient/apis/types';
import type { PKPData } from '../../LitChainClient/schemas/shared/PKPDataSchema';
import { PKPSignCreateRequestType } from './api-manager/pkpSign/pkpSign.CreateRequestType';
import { PKPSignInputSchema } from './api-manager/pkpSign/pkpSign.InputSchema';
import { PKPSignRequestDataSchema } from './api-manager/pkpSign/pkpSign.RequestDataSchema';
import { RequestItem } from '@lit-protocol/types';

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
        throw new Error(
          `The provided AuthContext is session-based and requires minting via a relayer, which uses its private key to mint a PKP and add your auth methods.
        
        If 'sendPkpToItself' is set to true, the private key used to mint the PKP (i.e., msg.sender) does NOT automatically retain control over the PKP just by being the minter.
        
        If the msg.sender's address was NOT included in the permittedAddresses array during minting, and no other permittedAuthMethod controlled by the msg.sender was added, then the msg.sender would lose control over the PKP's signing capabilities. The PKP NFT would be owned by its own address, and only the explicitly permitted entities would be able to use it.
        
        However, if the msg.sender's address WAS included in permittedAddresses, or an auth method they control was added, then they would retain control—not because they minted it, but because they were explicitly granted permission.`
        );
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
      },
      createRequest: async (params: PKPSignCreateRequestType) => {
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
      handleResponse: async (result: any) => {
        if (result.success) {
          console.log('✅ PKP Sign batch successful:', result.values);
          return { success: true, responses: result.values }; // Example success return
        } else {
          console.error('🚨 PKP Sign batch failed:', result.error);
          throw result.error;
        }
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
