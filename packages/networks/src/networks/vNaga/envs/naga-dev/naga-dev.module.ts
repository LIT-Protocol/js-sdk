import { version } from '@lit-protocol/constants';
import {
  AuthData,
  HexPrefixedSchema,
  JsonSignCustomSessionKeyRequestForPkpReturnSchema,
  JsonSignSessionKeyRequestForPkpReturnSchema,
  DecryptRequestSchema,
} from '@lit-protocol/schemas';
import { Hex } from 'viem';

import { z } from 'zod';
import { LitNetworkModuleBase } from '../../../types';
import type { ExpectedAccountOrWalletClient } from '../../LitChainClient/contract-manager/createContractsManager';
import { networkConfig } from './naga-dev.config';
import { PricingContextSchema } from './pricing-manager/PricingContextSchema';
import { issueSessionFromContext } from './session-manager/issueSessionFromContext';
import { createStateManager } from './state-manager/createStateManager';

// Import the necessary types for the explicit return type annotation
import {
  combineSignatureShares,
  mostCommonString,
  normalizeAndStringify,
} from '@lit-protocol/crypto';
import { getChildLogger } from '@lit-protocol/logger';
import {
  AuthMethod,
  AuthSig,
  CallbackParams,
  Optional,
  RequestItem,
} from '@lit-protocol/types';
import { computeAddress } from 'ethers/lib/utils';
import { createRequestId } from '../../../shared/helpers/createRequestId';
import { handleAuthServerRequest } from '../../../shared/helpers/handleAuthServerRequest';
import { composeLitUrl } from '../../endpoints-manager/composeLitUrl';
import { PKPPermissionsManager } from '../../LitChainClient/apis/highLevelApis';
import { PkpIdentifierRaw } from '../../LitChainClient/apis/rawContractApis/permissions/utils/resolvePkpTokenId';
import type { GenericTxRes, LitTxRes } from '../../LitChainClient/apis/types';
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
import { SignSessionKeyResponseDataSchema } from './api-manager/signSessionKey/signSessionKey.ResponseDataSchema';
import { DecryptRequestDataSchema } from './api-manager/decrypt/decrypt.RequestDataSchema';
import { DecryptResponseDataSchema } from './api-manager/decrypt/decrypt.ResponseDataSchema';
import { DecryptInputSchema } from './api-manager/decrypt/decrypt.InputSchema';
import { DecryptCreateRequestParams } from './api-manager/decrypt/decrypt.CreateRequestParams';
import {
  createChainManager,
  CreateChainManagerReturn,
} from './chain-manager/createChainManager';
import { getMaxPricesForNodeProduct } from './pricing-manager/getMaxPricesForNodeProduct';
import { getUserMaxPrice } from './pricing-manager/getUserMaxPrice';
import { MintWithMultiAuthsRequest } from '../../LitChainClient/apis/highLevelApis/mintPKP/mintWithMultiAuths';

const _logger = getChildLogger({
  module: 'naga-dev-module',
});

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
    httpProtocol: networkConfig.httpProtocol,
  },
  getNetworkName: () => networkConfig.network,
  getHttpProtocol: () => networkConfig.httpProtocol,
  getEndpoints: () => networkConfig.endpoints,
  getRpcUrl: () => networkConfig.rpcUrl,
  getChainConfig: () => networkConfig.chainConfig,
  getAuthServerBaseUrl: () => networkConfig.authServerBaseUrl,
  getMinimumThreshold: () => networkConfig.minimumThreshold,
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

  getMaxPricesForNodeProduct: getMaxPricesForNodeProduct,
  getUserMaxPrice: getUserMaxPrice,
  chainApi: {
    getPKPPermissionsManager: async (params: {
      pkpIdentifier: PkpIdentifierRaw;
      account: ExpectedAccountOrWalletClient;
    }): Promise<PKPPermissionsManager> => {
      const chainManager = createChainManager(params.account);
      return chainManager.api.pkpPermissionsManager(params.pkpIdentifier);
    },

    /**
     * Mints a PKP using EOA directly
     */
    mintWithEoa: async (params: {
      account: ExpectedAccountOrWalletClient;
    }): Promise<GenericTxRes<LitTxRes<PKPData>, PKPData>> => {
      const chainManager = createChainManager(params.account);
      const res = await chainManager.api.mintWithEoa();
      console.log('🔥 mintWithEoa res:', res);
      return {
        _raw: res,
        txHash: res.hash,
        data: res.data,
      };
    },

    /**
     * Mints a PKP using Auth Method
     */
    mintWithAuth: async (params: {
      account: ExpectedAccountOrWalletClient;
      authData: Optional<AuthData, 'accessToken'>;
      scopes: ('sign-anything' | 'personal-sign' | 'no-permissions')[];
    }): Promise<GenericTxRes<LitTxRes<PKPData>, PKPData>> => {
      const chainManager = createChainManager(params.account);
      const res = await chainManager.api.mintPKP({
        scopes: params.scopes,
        // authMethod: authMethod,
        authMethodId: params.authData.authMethodId,
        authMethodType: params.authData.authMethodType,
        pubkey: params.authData.publicKey,
      });
      return {
        _raw: res,
        txHash: res.hash,
        data: res.data,
      };
    },

    mintWithMultiAuths: async (
      params: {
        account: ExpectedAccountOrWalletClient;
      } & MintWithMultiAuthsRequest
    ): Promise<GenericTxRes<LitTxRes<PKPData>, PKPData>> => {
      const chainManager = createChainManager(params.account);
      const res = await chainManager.api.mintWithMultiAuths({
        authMethodIds: params.authMethodIds,
        authMethodTypes: params.authMethodTypes,
        authMethodScopes: params.authMethodScopes,
        pubkeys: params.pubkeys,
        addPkpEthAddressAsPermittedAddress:
          params.addPkpEthAddressAsPermittedAddress,
        sendPkpToItself: params.sendPkpToItself,
      });
      return {
        _raw: res,
        txHash: res.hash,
        data: res.data,
      };
    },
  },
  authService: {
    pkpMint: async (params: {
      authData: AuthData;
      authServerBaseUrl?: string;
    }) => {
      return await handleAuthServerRequest<PKPData>({
        jobName: 'PKP Minting',
        serverUrl: networkConfig.authServerBaseUrl || params.authServerBaseUrl!,
        path: '/pkp/mint',
        body: {
          authMethodType: params.authData.authMethodType,
          authMethodId: params.authData.authMethodId,
          pubkey: params.authData.publicKey,
        },
      });
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
        _logger.info('pkpSign:createRequest: Creating request', {
          params,
        });

        // -- 1. generate session sigs
        const sessionSigs = await issueSessionFromContext({
          pricingContext: PricingContextSchema.parse(params.pricingContext),
          authContext: params.authContext,
        });

        _logger.info('pkpSign:createRequest: Session sigs generated');

        // -- 2. generate requests
        const _requestId = createRequestId();
        const requests: RequestItem<
          z.infer<typeof PKPSignRequestDataSchema>
        >[] = [];

        _logger.info('pkpSign:createRequest: Request id generated');

        const urls = Object.keys(sessionSigs);

        for (const url of urls) {
          _logger.info('pkpSign:createRequest: Generating request data', {
            url,
          });
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

          _logger.info('pkpSign:createRequest: Url with path generated', {
            _urlWithPath,
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
          _logger.error(
            'pkpSign:createRequest: No requests generated for pkpSign.'
          );
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
    decrypt: {
      schemas: {
        Input: DecryptInputSchema,
        RequestData: DecryptRequestDataSchema,
        ResponseData: DecryptResponseDataSchema,
      },
      createRequest: async (params: DecryptCreateRequestParams) => {
        _logger.info('decrypt:createRequest: Creating request', {
          params,
        });

        // -- 1. generate session sigs for decrypt
        const sessionSigs = await issueSessionFromContext({
          pricingContext: PricingContextSchema.parse(params.pricingContext),
          authContext: params.authContext,
        });

        _logger.info('decrypt:createRequest: Session sigs generated');

        // -- 2. generate requests
        const _requestId = createRequestId();
        const requests: RequestItem<
          z.infer<typeof DecryptRequestDataSchema>
        >[] = [];

        _logger.info('decrypt:createRequest: Request id generated');

        const urls = Object.keys(sessionSigs);

        for (const url of urls) {
          _logger.info('decrypt:createRequest: Generating request data', {
            url,
          });
          
          const _requestData = DecryptRequestDataSchema.parse({
            ciphertext: params.ciphertext,
            dataToEncryptHash: params.dataToEncryptHash,
            accessControlConditions: params.accessControlConditions,
            evmContractConditions: params.evmContractConditions,
            solRpcConditions: params.solRpcConditions,
            unifiedAccessControlConditions: params.unifiedAccessControlConditions,
            authSig: sessionSigs[url],
            chain: params.chain,
          });

          const _urlWithPath = composeLitUrl({
            url,
            endpoint: nagaDevModuleObject.getEndpoints().ENCRYPTION_SIGN,
          });

          _logger.info('decrypt:createRequest: Url with path generated', {
            _urlWithPath,
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
          _logger.error(
            'decrypt:createRequest: No requests generated for decrypt.'
          );
          throw new Error('Failed to generate requests for decrypt.');
        }

        return requests;
      },
      handleResponse: async (
        result: ProcessedBatchResult<z.infer<typeof DecryptResponseDataSchema>>,
        requestId: string,
        identityParam: string,
        ciphertext: string,
        subnetPubKey: string
      ) => {
        _logger.info('decrypt:handleResponse: Processing decrypt response', {
          requestId,
        });

        if (!result.success) {
          console.error(
            '🚨 Decrypt batch failed in handleResponse:',
            result.error
          );
          throw Error(JSON.stringify(result.error));
        }

        // result.values contains the array of node responses
        const values = result.values;

        _logger.info('decrypt:handleResponse: Values', {
          values,
        });

        // Extract signature shares from node responses
        const signatureShares = values.map((nodeResponse: any) => {
          return {
            ProofOfPossession: {
              identifier: nodeResponse.signatureShare.ProofOfPossession.identifier,
              value: nodeResponse.signatureShare.ProofOfPossession.value,
            },
          };
        });

        _logger.info('decrypt:handleResponse: Signature shares extracted', {
          signatureShares,
        });

        // Import decrypt function
        const { verifyAndDecryptWithSignatureShares } = await import('@lit-protocol/crypto');
        const { uint8arrayFromString } = await import('@lit-protocol/uint8arrays');

        // Verify and decrypt using signature shares
        const decryptedData = await verifyAndDecryptWithSignatureShares(
          subnetPubKey,
          uint8arrayFromString(identityParam, 'utf8'),
          ciphertext,
          signatureShares
        );

        _logger.info('decrypt:handleResponse: Decryption completed');

        return { decryptedData };
      },
    },
    signSessionKey: {
      schemas: {},
      createRequest: async (
        requestBody: z.infer<
          typeof JsonSignSessionKeyRequestForPkpReturnSchema
        >,
        httpProtocol: 'http://' | 'https://',
        version: string
      ) => {
        type RequestBodyType = {
          sessionKey: string;
          authMethods: AuthMethod[];
          pkpPublicKey?: string;
          siweMessage: string;
          curveType: 'BLS';
          epoch?: number;
          nodeSet: { value: number; socketAddress: string }[];
        };

        _logger.info('signSessionKey:createRequest: Request body', {
          requestBody,
        });

        const nodeUrls = requestBody.nodeSet.map(
          (node) => `${httpProtocol}${node.socketAddress}`
        );

        _logger.info('signSessionKey:createRequest: Node urls', {
          nodeUrls,
        });

        // extract the authMethod from the requestBody
        const authMethod = {
          authMethodType: requestBody.authData.authMethodType,
          accessToken: requestBody.authData.accessToken,
        } as AuthMethod;

        const requests = [];

        for (const url of nodeUrls) {
          const _urlWithPath = composeLitUrl({
            url,
            endpoint: nagaDevModuleObject.getEndpoints().SIGN_SESSION_KEY,
          });

          const _body: RequestBodyType = {
            sessionKey: requestBody.sessionKey,
            authMethods: [authMethod],
            pkpPublicKey: requestBody.pkpPublicKey,
            siweMessage: requestBody.siweMessage,
            curveType: 'BLS',
            epoch: requestBody.epoch,
            nodeSet: requestBody.nodeSet,
          };

          requests.push({
            fullPath: _urlWithPath,
            data: _body,
            requestId: createRequestId(),
            epoch: requestBody.epoch,
            version: version,
          });
        }

        if (!requests || requests.length === 0) {
          _logger.error(
            'signSessionKey:createRequest: No requests generated for signSessionKey.'
          );
          throw new Error('Failed to generate requests for signSessionKey.');
        }

        return requests;
      },
      handleResponse: async (
        result: ProcessedBatchResult<
          z.infer<typeof SignSessionKeyResponseDataSchema>
        >,
        pkpPublicKey: Hex | string
      ) => {
        if (!result.success) {
          console.error(
            '🚨 Sign Session Key batch failed in handleResponse:',
            result.error
          );
          throw Error(JSON.stringify(result.error));
        }

        const { values } = SignSessionKeyResponseDataSchema.parse(result);

        _logger.info('signSessionKey:handleResponse: Values', {
          values,
        });

        const signatureShares = values.map((s) => ({
          ProofOfPossession: {
            identifier: s.signatureShare.ProofOfPossession.identifier,
            value: s.signatureShare.ProofOfPossession.value,
          },
        }));

        _logger.info('signSessionKey:handleResponse: Signature shares', {
          signatureShares,
        });

        // naga-wasm
        // datil-wasm (we could use the existing package for this or
        // we should make the current wasm work with Datil too.)
        const blsCombinedSignature = await combineSignatureShares(
          signatureShares
        );

        _logger.info('signSessionKey:handleResponse: BLS combined signature', {
          blsCombinedSignature,
        });

        const _pkpPublicKey = HexPrefixedSchema.parse(pkpPublicKey);

        const mostCommonSiweMessage = mostCommonString(
          values.map((s) => s.siweMessage)
        );

        const signedMessage = normalizeAndStringify(mostCommonSiweMessage!);

        _logger.info('signSessionKey:handleResponse: Signed message', {
          signedMessage,
        });

        const authSig: AuthSig = {
          sig: JSON.stringify({
            ProofOfPossession: blsCombinedSignature,
          }),
          algo: 'LIT_BLS',
          derivedVia: 'lit.bls',
          signedMessage,
          address: computeAddress(_pkpPublicKey),
        };

        _logger.info('signSessionKey:handleResponse: Auth sig', {
          authSig,
        });

        return authSig;
      },
    },
    signCustomSessionKey: {
      schemas: {},
      createRequest: async (
        requestBody: z.infer<
          typeof JsonSignCustomSessionKeyRequestForPkpReturnSchema
        >,
        httpProtocol: 'http://' | 'https://',
        version: string
      ) => {
        type RequestBodyType = {
          sessionKey: string;
          authMethods: AuthMethod[];
          pkpPublicKey?: string;
          siweMessage: string;
          curveType: 'BLS';
          epoch?: number;
          nodeSet: { value: number; socketAddress: string }[];
          litActionCode?: string;
          litActionIpfsId?: string;
          jsParams?: Record<string, any>;
        };

        _logger.info('signSessionKey:createRequest: Request body', {
          requestBody,
        });

        const nodeUrls = requestBody.nodeSet.map(
          (node) => `${httpProtocol}${node.socketAddress}`
        );

        _logger.info('signSessionKey:createRequest: Node urls', {
          nodeUrls,
        });

        // extract the authMethod from the requestBody
        // const authMethod = {
        //   authMethodType: requestBody.authData.authMethodType,
        //   accessToken: requestBody.authData.accessToken,
        // } as AuthMethod;

        const requests = [];

        for (const url of nodeUrls) {
          const _urlWithPath = composeLitUrl({
            url,
            endpoint: nagaDevModuleObject.getEndpoints().SIGN_SESSION_KEY,
          });

          const _body: RequestBodyType = {
            sessionKey: requestBody.sessionKey,
            authMethods: [],
            pkpPublicKey: requestBody.pkpPublicKey,
            siweMessage: requestBody.siweMessage,
            curveType: 'BLS',
            epoch: requestBody.epoch,
            nodeSet: requestBody.nodeSet,
            litActionCode: requestBody.litActionCode,
            litActionIpfsId: requestBody.litActionIpfsId,
            jsParams: requestBody.jsParams,
          };

          requests.push({
            fullPath: _urlWithPath,
            data: _body,
            requestId: createRequestId(),
            epoch: requestBody.epoch,
            version: version,
          });
        }

        if (!requests || requests.length === 0) {
          _logger.error(
            'signSessionKey:createRequest: No requests generated for signSessionKey.'
          );
          throw new Error('Failed to generate requests for signSessionKey.');
        }

        // console.log("🔥🔥🔥 requests:", requests);
        // process.exit();

        return requests;
      },
      handleResponse: async (
        result: ProcessedBatchResult<
          z.infer<typeof SignSessionKeyResponseDataSchema>
        >,
        pkpPublicKey: Hex | string
      ) => {
        if (!result.success) {
          console.error(
            '🚨 Sign Session Key batch failed in handleResponse:',
            result.error
          );
          throw Error(JSON.stringify(result.error));
        }

        const { values } = SignSessionKeyResponseDataSchema.parse(result);

        _logger.info('signSessionKey:handleResponse: Values', {
          values,
        });

        const signatureShares = values.map((s) => ({
          ProofOfPossession: {
            identifier: s.signatureShare.ProofOfPossession.identifier,
            value: s.signatureShare.ProofOfPossession.value,
          },
        }));

        _logger.info('signSessionKey:handleResponse: Signature shares', {
          signatureShares,
        });

        // naga-wasm
        // datil-wasm (we could use the existing package for this or
        // we should make the current wasm work with Datil too.)
        const blsCombinedSignature = await combineSignatureShares(
          signatureShares
        );

        _logger.info('signSessionKey:handleResponse: BLS combined signature', {
          blsCombinedSignature,
        });

        const _pkpPublicKey = HexPrefixedSchema.parse(pkpPublicKey);

        const mostCommonSiweMessage = mostCommonString(
          values.map((s) => s.siweMessage)
        );

        const signedMessage = normalizeAndStringify(mostCommonSiweMessage!);

        _logger.info('signSessionKey:handleResponse: Signed message', {
          signedMessage,
        });

        const authSig: AuthSig = {
          sig: JSON.stringify({
            ProofOfPossession: blsCombinedSignature,
          }),
          algo: 'LIT_BLS',
          derivedVia: 'lit.bls',
          signedMessage,
          address: computeAddress(_pkpPublicKey),
        };

        _logger.info('signSessionKey:handleResponse: Auth sig', {
          authSig,
        });

        return authSig;
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
