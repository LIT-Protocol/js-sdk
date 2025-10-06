import { DEV_PRIVATE_KEY, version } from '@lit-protocol/constants';
import { verifyAndDecryptWithSignatureShares } from '@lit-protocol/crypto';
import {
  AuthData,
  AuthDataInput,
  EncryptedVersion1Schema,
  GenericEncryptedPayloadSchema,
  GenericResultBuilder,
  HexPrefixedSchema,
  JsonSignCustomSessionKeyRequestForPkpReturnSchema,
  JsonSignSessionKeyRequestForPkpReturnSchema,
  ScopeStringSchema,
} from '@lit-protocol/schemas';
import { Hex, hexToBytes, stringToBytes } from 'viem';
import { z } from 'zod';

// Base types
import { LitNetworkModuleBase } from '../../../types';
import type { INetworkConfig } from '../interfaces/NetworkContext';
import type { ExpectedAccountOrWalletClient } from '../managers/contract-manager/createContractsManager';
import { createChainManagerFactory } from './BaseChainManagerFactory';

// Shared utilities
import { NetworkError } from '@lit-protocol/constants';
import {
  combineSignatureShares,
  mostCommonString,
  normalizeAndStringify,
  ReleaseVerificationConfig,
} from '@lit-protocol/crypto';
import { getChildLogger } from '@lit-protocol/logger';
import { nacl } from '@lit-protocol/nacl';
import {
  AuthMethod,
  AuthSig,
  CallbackParams,
  KeySet,
  LitActionResponseStrategy,
  NagaJitContext,
  NodeAttestation,
  Optional,
  OrchestrateHandshakeResponse,
  RequestItem,
} from '@lit-protocol/types';
import { ethers } from 'ethers';
import { computeAddress } from 'ethers/lib/utils';
import type { PKPStorageProvider } from '../../../../storage/types';

// Shared managers and utilities
import { privateKeyToAccount } from 'viem/accounts';
import { handleAuthServerRequest } from '../../../shared/helpers/handleAuthServerRequest';
import { createRequestId } from '../helpers/createRequestId';
import { composeLitUrl } from '../managers/endpoints-manager/composeLitUrl';
import {
  getNodePrices,
  PKPPermissionsManager,
} from '../managers/LitChainClient/apis/highLevelApis';
import { MintWithMultiAuthsRequest } from '../managers/LitChainClient/apis/highLevelApis/mintPKP/mintWithMultiAuths';
import { PaymentManager } from '../managers/LitChainClient/apis/highLevelApis/PaymentManager/PaymentManager';
import { PkpIdentifierRaw } from '../managers/LitChainClient/apis/rawContractApis/permissions/utils/resolvePkpTokenId';
import type {
  GenericTxRes,
  LitTxRes,
} from '../managers/LitChainClient/apis/types';
import type { PKPData } from '../managers/LitChainClient/schemas/shared/PKPDataSchema';
import { ConnectionInfo } from '../managers/LitChainClient/types';

// Shared API components
import { E2EERequestManager } from '../managers/api-manager/e2ee-request-manager/E2EERequestManager';
import { combinePKPSignSignatures } from '../managers/api-manager/helper/get-signatures';
import { getMaxPricesForNodeProduct } from '../managers/pricing-manager/getMaxPricesForNodeProduct';
import { getUserMaxPrice } from '../managers/pricing-manager/getUserMaxPrice';
import { PricingContextSchema } from '../managers/pricing-manager/schema';
import { issueSessionFromContext } from '../managers/session-manager/issueSessionFromContext';
import { createStateManager } from '../managers/state-manager/createStateManager';

// Shared schemas - import from shared location
import { DecryptCreateRequestParams } from '../managers/api-manager/decrypt/decrypt.CreateRequestParams';
import { DecryptInputSchema } from '../managers/api-manager/decrypt/decrypt.InputSchema';
import { DecryptRequestDataSchema } from '../managers/api-manager/decrypt/decrypt.RequestDataSchema';
import { DecryptResponseDataSchema } from '../managers/api-manager/decrypt/decrypt.ResponseDataSchema';

import { ExecuteJsCreateRequestParams } from '../managers/api-manager/executeJs/executeJs.CreateRequestParams';

import { handleResponse as handleExecuteJsResponse } from '../managers/api-manager/executeJs';
import { ExecuteJsInputSchema } from '../managers/api-manager/executeJs/executeJs.InputSchema';
import { ExecuteJsRequestDataSchema } from '../managers/api-manager/executeJs/executeJs.RequestDataSchema';
import { ExecuteJsResponseDataSchema } from '../managers/api-manager/executeJs/executeJs.ResponseDataSchema';

import { RawHandshakeResponseSchema } from '../managers/api-manager/handshake/handshake.schema';
import { PKPSignCreateRequestParams } from '../managers/api-manager/pkpSign/pkpSign.CreateRequestParams';
import {
  BitCoinPKPSignInputSchema,
  EthereumPKPSignInputSchema,
  PKPSignInputSchema,
} from '../managers/api-manager/pkpSign/pkpSign.InputSchema';
import { PKPSignRequestDataSchema } from '../managers/api-manager/pkpSign/pkpSign.RequestDataSchema';
import { PKPSignResponseDataSchema } from '../managers/api-manager/pkpSign/pkpSign.ResponseDataSchema';

// Configuration interface for environment-specific settings
export interface BaseModuleConfig<T, M> {
  networkConfig: INetworkConfig<T, M>;
  moduleName: string;
  createChainManager: (
    account: ExpectedAccountOrWalletClient
  ) => ReturnType<typeof createChainManagerFactory>;
  verifyReleaseId?: (
    attestation: NodeAttestation,
    config: ReleaseVerificationConfig
  ) => Promise<void>;
}

// Release verification constants and types
// interface ReleaseInfo {
//   status: number;
//   env: number;
//   typ: number;
//   platform: number;
//   options: { asU32: () => number };
//   publicKey: Uint8Array;
//   idKeyDigest: Uint8Array;
// }

enum ReleaseStatus {
  Null = 0,
  Active = 1,
  Inactive = 2,
}

const RELEASE_REGISTER_ABI = [
  {
    inputs: [],
    name: 'RELEASE_REGISTER_CONTRACT',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

// Utility functions for release verification
function extractReleaseId(attestation: NodeAttestation): string {
  const releaseId = attestation.data.RELEASE_ID;
  if (!releaseId) {
    throw new NetworkError(
      { info: { attestation } },
      'Missing RELEASE_ID in attestation data'
    );
  }
  return Buffer.from(releaseId, 'base64').toString('utf8');
}

function getSubnetIdFromReleaseId(releaseId: string): string {
  const parts = releaseId.split('-');
  if (parts.length < 2) {
    throw new NetworkError(
      { info: { releaseId } },
      'Invalid release ID format'
    );
  }
  return parts[0];
}

function padReleaseIdToBytes32(releaseId: string): string {
  const releaseIdBuffer = Buffer.from(releaseId, 'utf8');
  if (releaseIdBuffer.length > 32) {
    throw new NetworkError(
      { info: { releaseId } },
      'Release ID too long for bytes32'
    );
  }
  const paddedBuffer = Buffer.alloc(32);
  releaseIdBuffer.copy(paddedBuffer);
  return ethers.utils.hexlify(paddedBuffer);
}

// Default release verification implementation
const defaultVerifyReleaseId = async (
  attestation: NodeAttestation,
  config: ReleaseVerificationConfig
): Promise<void> => {
  const releaseId = extractReleaseId(attestation);

  if (releaseId.length !== 64) {
    throw new NetworkError(
      {
        info: { releaseId, expectedLength: 64, actualLength: releaseId.length },
      },
      `Release ID length is incorrect: expected 64, got ${releaseId.length}`
    );
  }

  const releaseSubnetId = getSubnetIdFromReleaseId(releaseId);
  if (releaseSubnetId !== config.subnetId) {
    throw new NetworkError(
      { info: { releaseSubnetId, expectedSubnetId: config.subnetId } },
      `Subnet ID mismatch: expected ${config.subnetId}, got ${releaseSubnetId}`
    );
  }

  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  const contract = new ethers.Contract(
    config.releaseRegisterContractAddress,
    RELEASE_REGISTER_ABI,
    provider
  );

  const releaseIdPadded = padReleaseIdToBytes32(releaseId);

  try {
    const release = await contract['getReleaseByIdAndSubnetId'](
      config.subnetId,
      releaseIdPadded
    );

    if (release.status !== ReleaseStatus.Active) {
      throw new NetworkError(
        { info: { releaseId, status: release.status } },
        `Release is not active: status ${release.status}`
      );
    }

    if (release.env !== config.environment) {
      throw new NetworkError(
        {
          info: {
            releaseId,
            releaseEnv: release.env,
            expectedEnv: config.environment,
          },
        },
        `Environment mismatch: expected ${config.environment}, got ${release.env}`
      );
    }
  } catch (error: any) {
    if (error.code === 'CALL_EXCEPTION') {
      throw new NetworkError(
        {
          info: {
            releaseId,
            contractAddress: config.releaseRegisterContractAddress,
          },
        },
        `Release ID ${releaseId} not found on chain`
      );
    }
    throw error;
  }
};

// Type for processed batch results
type ProcessedBatchResult<T> =
  | { success: true; values: T[] }
  | { success: false; error: any; failedNodeUrls?: string[] };

/**
 * Factory function that creates a complete network module for any environment
 * This eliminates code duplication by providing a single implementation
 * that can be configured for different environments
 */
export function createBaseModule<T, M>(config: BaseModuleConfig<T, M>) {
  const { networkConfig, moduleName, createChainManager } = config;
  const _logger = getChildLogger({ module: `${moduleName}-module` });

  // Store response strategy for executeJs requests
  let executeJsResponseStrategy: LitActionResponseStrategy | undefined;

  // Create the base module object with all shared functionality
  const baseModule = {
    id: 'naga',
    version: `${version}-${moduleName}`,
    config: {
      requiredAttestation: networkConfig.requiredAttestation,
      abortTimeout: 20_000,
      minimumThreshold: networkConfig.minimumThreshold,
      httpProtocol: networkConfig.httpProtocol,
    },
    schemas: {
      GenericResponseSchema: GenericResultBuilder,
    },

    // Basic getters - all environments need these
    getNetworkName: () => networkConfig.network,
    getHttpProtocol: () => networkConfig.httpProtocol,
    getEndpoints: () => networkConfig.endpoints,
    getRpcUrl: () => networkConfig.rpcUrl,
    getChainConfig: () => networkConfig.chainConfig,
    getDefaultLoginBaseUrl: () => networkConfig.services.loginServiceBaseUrl,
    getMinimumThreshold: () => networkConfig.minimumThreshold,

    // State management - shared implementation
    createStateManager: async <StateT, ModuleT>(params: {
      callback: (params: CallbackParams) => Promise<StateT>;
      networkModule: ModuleT;
    }): Promise<Awaited<ReturnType<typeof createStateManager<StateT>>>> => {
      const createReadOnlyChainManager = () => {
        const dummyAccount = privateKeyToAccount(DEV_PRIVATE_KEY);
        return createChainManager(dummyAccount);
      };

      return await createStateManager<StateT>({
        networkConfig,
        callback: params.callback,
        networkModule: params.networkModule as LitNetworkModuleBase,
        createReadOnlyChainManager,
      });
    },

    // Pricing - shared implementation
    getMaxPricesForNodeProduct: getMaxPricesForNodeProduct,
    getUserMaxPrice: getUserMaxPrice,
    getVerifyReleaseId: () => config.verifyReleaseId || defaultVerifyReleaseId,

    // Chain API - shared implementation with environment-specific chain manager
    chainApi: {
      getPKPPermissionsManager: async (params: {
        pkpIdentifier: PkpIdentifierRaw;
        account: ExpectedAccountOrWalletClient;
      }): Promise<PKPPermissionsManager> => {
        const chainManager = createChainManager(params.account);
        return chainManager.api.pkpPermissionsManager(params.pkpIdentifier);
      },

      getPaymentManager: async (params: {
        account: ExpectedAccountOrWalletClient;
      }): Promise<PaymentManager> => {
        const chainManager = createChainManager(params.account);
        return chainManager.api.paymentManager();
      },

      getPKPsByAuthData: async (params: {
        authData: Partial<AuthData>;
        pagination?: { limit?: number; offset?: number };
        storageProvider?: PKPStorageProvider;
        account: ExpectedAccountOrWalletClient;
      }) => {
        const chainManager = createChainManager(params.account);
        return chainManager.api.getPKPsByAuthData(
          params.authData,
          params.pagination,
          params.storageProvider
        );
      },

      getPKPsByAddress: async (params: {
        ownerAddress: string;
        pagination?: { limit?: number; offset?: number };
        storageProvider?: PKPStorageProvider;
        account: ExpectedAccountOrWalletClient;
      }) => {
        const chainManager = createChainManager(params.account);
        return chainManager.api.getPKPsByAddress({
          ownerAddress: params.ownerAddress,
          pagination: params.pagination,
          storageProvider: params.storageProvider,
        });
      },

      mintWithEoa: async (params: {
        account: ExpectedAccountOrWalletClient;
      }): Promise<GenericTxRes<LitTxRes<PKPData>, PKPData>> => {
        const chainManager = createChainManager(params.account);
        const res = await chainManager.api.mintWithEoa();
        return {
          _raw: res,
          txHash: res.hash,
          data: res.data,
        };
      },

      mintWithAuth: async (params: {
        account: ExpectedAccountOrWalletClient;
        authData: Optional<AuthDataInput, 'accessToken'>;
        scopes: z.infer<typeof ScopeStringSchema>[];
      }): Promise<GenericTxRes<LitTxRes<PKPData>, PKPData>> => {
        const chainManager = createChainManager(params.account);
        const res = await chainManager.api.mintPKP({
          scopes: params.scopes,
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

    // Auth service - shared implementation
    authService: {
      pkpMint: async (params: {
        authData: AuthData;
        authServiceBaseUrl: string;
        scopes?: ('sign-anything' | 'personal-sign' | 'no-permissions')[];
        apiKey?: string;
      }) => {
        console.log('[BaseModuleFactory.authService.pkpMint] params:', params);
        return await handleAuthServerRequest<PKPData>({
          jobName: 'PKP Minting',
          serverUrl: params.authServiceBaseUrl,
          path: '/pkp/mint',
          body: {
            authMethodType: params.authData.authMethodType,
            authMethodId: params.authData.authMethodId,
            pubkey: params.authData.publicKey,
            scopes: params.scopes,
          },
          headers: params.apiKey ? { 'x-api-key': params.apiKey } : undefined,
        });
      },
    },

    // Main API implementation - all shared
    api: {
      /**
       * Creates JIT context for network operations
       */
      createJitContext: async (
        connectionInfo: ConnectionInfo,
        handshakeResult: OrchestrateHandshakeResponse
      ): Promise<NagaJitContext> => {
        const keySet: KeySet = {};

        const respondingUrls = Object.keys(handshakeResult.serverKeys);
        const respondingUrlSet = new Set(respondingUrls);

        if (respondingUrls.length === 0) {
          throw new Error(
            `Handshake response did not include any node identity keys. Received handshake result: ${JSON.stringify(
              handshakeResult
            )}`
          );
        }

        for (const url of respondingUrls) {
          const serverKey = handshakeResult.serverKeys[url];

          if (!serverKey || !serverKey.nodeIdentityKey) {
            throw new Error(
              `Handshake response missing node identity key for node ${url}. Received handshake result: ${JSON.stringify(
                handshakeResult
              )}`
            );
          }

          keySet[url] = {
            publicKey: hexToBytes(
              HexPrefixedSchema.parse(
                serverKey.nodeIdentityKey
              ) as `0x${string}`
            ),
            secretKey: nacl.box.keyPair().secretKey,
          };
        }

        const missingUrls = connectionInfo.bootstrapUrls.filter(
          (url) => !keySet[url]
        );

        if (missingUrls.length > 0) {
          _logger.warn(
            { missingUrls },
            'Some bootstrap URLs did not complete the handshake; proceeding with responding nodes only'
          );
        }

        // Use read-only account for viewing PKPs
        const account = privateKeyToAccount(DEV_PRIVATE_KEY);

        // Fetch the price feed info
        const nodePrices = await getNodePrices(
          {
            realmId: 1,
            networkCtx: networkConfig,
          },
          account
        );

        const filteredNodePrices = nodePrices.filter((price) =>
          respondingUrlSet.has(price.url)
        );

        if (filteredNodePrices.length === 0) {
          throw new Error(
            'Unable to resolve price data for responding handshake nodes'
          );
        }

        if (filteredNodePrices.length !== nodePrices.length) {
          const excludedByPriceFeed = nodePrices
            .filter((price) => !respondingUrlSet.has(price.url))
            .map((price) => price.url);
          _logger.warn(
            { excludedByPriceFeed },
            'Price feed included nodes that did not complete the handshake; excluding them from pricing context'
          );
        }

        return { keySet, nodePrices: filteredNodePrices };
      },

      /**
       * Handshake API
       */
      handshake: {
        schemas: {
          Input: {
            ResponseData: RawHandshakeResponseSchema,
          },
        },
      },

      /**
       * PKP Sign API - shared implementation
       */
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
        createRequest: async (
          params: PKPSignCreateRequestParams
        ): Promise<RequestItem<z.infer<typeof EncryptedVersion1Schema>>[]> => {
          _logger.info({ params }, 'pkpSign:createRequest: Creating request');

          // Generate session sigs
          const sessionSigs = await issueSessionFromContext({
            pricingContext: PricingContextSchema.parse(params.pricingContext),
            authContext: params.authContext,
          });

          _logger.info('pkpSign:createRequest: Session sigs generated');

          // Generate requests
          const _requestId = createRequestId();
          const requests: RequestItem<
            z.infer<typeof EncryptedVersion1Schema>
          >[] = [];
          const urls = Object.keys(sessionSigs);

          for (const url of urls) {
            _logger.info(
              { url },
              'pkpSign:createRequest: Generating request data'
            );

            const _requestData = PKPSignRequestDataSchema.parse({
              toSign: Array.from(params.signingContext.toSign),
              signingScheme: params.signingContext.signingScheme,
              pubkey: params.signingContext.pubKey,
              authSig: sessionSigs[url],
              nodeSet: urls,
              chain: params.chain,
              bypassAutoHashing: params.signingContext.bypassAutoHashing,
              epoch: params.connectionInfo.epochState.currentNumber,
            });

            const encryptedPayload = E2EERequestManager.encryptRequestData(
              _requestData,
              url,
              params.jitContext
            );

            const _urlWithPath = composeLitUrl({
              url,
              endpoint: baseModule.getEndpoints().PKP_SIGN,
            });

            requests.push({
              fullPath: _urlWithPath,
              data: encryptedPayload,
              requestId: _requestId,
              epoch: params.connectionInfo.epochState.currentNumber,
              version: params.version,
            });
          }

          if (!requests || requests.length === 0) {
            throw new Error('Failed to generate requests for pkpSign.');
          }

          return requests;
        },
        handleResponse: async (
          result: z.infer<typeof GenericEncryptedPayloadSchema>,
          requestId: string,
          jitContext: NagaJitContext
        ) => {
          if (!result.success) {
            E2EERequestManager.handleEncryptedError(
              result,
              jitContext,
              'PKP Sign'
            );
          }

          const decryptedValues = E2EERequestManager.decryptBatchResponse(
            result,
            jitContext,
            (decryptedJson) => {
              const pkpSignData = decryptedJson.data;
              if (!pkpSignData) {
                throw new Error('Decrypted response missing data field');
              }

              const wrappedData = {
                success: pkpSignData.success,
                values: [pkpSignData],
              };

              const responseData = PKPSignResponseDataSchema.parse(wrappedData);
              return responseData.values[0];
            }
          );

          const signatures = await combinePKPSignSignatures({
            nodesPkpSignResponseData: decryptedValues,
            requestId,
            threshold: networkConfig.minimumThreshold,
          });

          return signatures;
        },
      },

      /**
       * Decrypt API - shared implementation
       */
      decrypt: {
        schemas: {
          Input: DecryptInputSchema,
          RequestData: DecryptRequestDataSchema,
          ResponseData: DecryptResponseDataSchema,
        },
        createRequest: async (params: DecryptCreateRequestParams) => {
          _logger.info({ params }, 'decrypt:createRequest: Creating request');

          // Generate session sigs for decrypt
          const sessionSigs = await issueSessionFromContext({
            pricingContext: PricingContextSchema.parse(params.pricingContext),
            authContext: params.authContext,
          });

          _logger.info('decrypt:createRequest: Session sigs generated');

          // Generate requests
          const _requestId = createRequestId();
          const requests: RequestItem<
            z.infer<typeof EncryptedVersion1Schema>
          >[] = [];
          const urls = Object.keys(sessionSigs);

          for (const url of urls) {
            const _requestData = DecryptRequestDataSchema.parse({
              ciphertext: params.ciphertext,
              dataToEncryptHash: params.dataToEncryptHash,
              accessControlConditions: params.accessControlConditions,
              evmContractConditions: params.evmContractConditions,
              solRpcConditions: params.solRpcConditions,
              unifiedAccessControlConditions:
                params.unifiedAccessControlConditions,
              authSig: sessionSigs[url],
              chain: params.chain,
            });

            const encryptedPayload = E2EERequestManager.encryptRequestData(
              _requestData,
              url,
              params.jitContext
            );

            const _urlWithPath = composeLitUrl({
              url,
              endpoint: baseModule.getEndpoints().ENCRYPTION_SIGN,
            });

            requests.push({
              fullPath: _urlWithPath,
              data: encryptedPayload,
              requestId: _requestId,
              epoch: params.connectionInfo.epochState.currentNumber,
              version: params.version,
            });
          }

          return requests;
        },
        handleResponse: async (
          result: z.infer<typeof GenericEncryptedPayloadSchema>,
          requestId: string,
          identityParam: string,
          ciphertext: string,
          subnetPubKey: string,
          jitContext: NagaJitContext
        ) => {
          _logger.info(
            { requestId },
            'decrypt:handleResponse: Processing decrypt response'
          );

          if (!result.success) {
            E2EERequestManager.handleEncryptedError(
              result,
              jitContext,
              'Decryption'
            );
          }

          const decryptedValues = E2EERequestManager.decryptBatchResponse(
            result,
            jitContext,
            (decryptedJson) => {
              const decryptData = decryptedJson.data;
              if (!decryptData) {
                throw new Error('Decrypted response missing data field');
              }
              const responseData = DecryptResponseDataSchema.parse(decryptData);
              return responseData;
            }
          );

          // Extract signature shares from decrypted node responses
          const signatureShares = decryptedValues.map((nodeResponse: any) => {
            return {
              ProofOfPossession: {
                identifier:
                  nodeResponse.signatureShare.ProofOfPossession.identifier,
                value: nodeResponse.signatureShare.ProofOfPossession.value,
              },
            };
          });

          // Verify and decrypt using signature shares
          const decryptedData = await verifyAndDecryptWithSignatureShares(
            subnetPubKey,
            stringToBytes(identityParam),
            ciphertext,
            signatureShares
          );

          return { decryptedData };
        },
      },

      /**
       * Session Key Signing APIs - shared implementation
       */
      signSessionKey: {
        schemas: {},
        createRequest: async (
          requestBody: z.infer<
            typeof JsonSignSessionKeyRequestForPkpReturnSchema
          >,
          httpProtocol: 'http://' | 'https://',
          version: string,
          jitContext: NagaJitContext
        ) => {
          const nodeUrls = requestBody.nodeSet.map(
            (node) => `${httpProtocol}${node.socketAddress}`
          );

          const authMethod = {
            authMethodType: requestBody.authData.authMethodType,
            accessToken: requestBody.authData.accessToken,
          } as AuthMethod;

          const requests: RequestItem<
            z.infer<typeof EncryptedVersion1Schema>
          >[] = [];
          const _requestId = createRequestId();

          for (const url of nodeUrls) {
            const _requestData = {
              sessionKey: requestBody.sessionKey,
              authMethods: [authMethod],
              pkpPublicKey: requestBody.pkpPublicKey,
              siweMessage: requestBody.siweMessage,
              curveType: 'BLS' as const,
              epoch: requestBody.epoch,
              nodeSet: requestBody.nodeSet,
              maxPrice: getUserMaxPrice({
                product: 'SIGN_SESSION_KEY',
              }).toString(),
            };

            const encryptedPayload = E2EERequestManager.encryptRequestData(
              _requestData,
              url,
              jitContext
            );

            const _urlWithPath = composeLitUrl({
              url,
              endpoint: baseModule.getEndpoints().SIGN_SESSION_KEY,
            });

            requests.push({
              fullPath: _urlWithPath,
              data: encryptedPayload,
              requestId: _requestId,
              epoch: requestBody.epoch,
              version: version,
            });
          }

          return requests;
        },
        handleResponse: async (
          result: z.infer<typeof GenericEncryptedPayloadSchema>,
          pkpPublicKey: Hex | string,
          jitContext: NagaJitContext
        ) => {
          if (!result.success) {
            E2EERequestManager.handleEncryptedError(
              result,
              jitContext,
              'Session key signing'
            );
          }

          const decryptedValues = E2EERequestManager.decryptBatchResponse(
            result,
            jitContext,
            (decryptedJson) => {
              const signSessionKeyData = decryptedJson.data;
              if (!signSessionKeyData) {
                throw new Error('Decrypted response missing data field');
              }
              return signSessionKeyData;
            }
          );

          const values = decryptedValues;
          const signatureShares = values.map((s) => ({
            ProofOfPossession: {
              identifier: s.signatureShare.ProofOfPossession.identifier,
              value: s.signatureShare.ProofOfPossession.value,
            },
          }));

          const blsCombinedSignature = await combineSignatureShares(
            signatureShares
          );
          const _pkpPublicKey = HexPrefixedSchema.parse(pkpPublicKey);
          const mostCommonSiweMessage = mostCommonString(
            values.map((s) => s.siweMessage)
          );
          const signedMessage = normalizeAndStringify(mostCommonSiweMessage!);

          const authSig: AuthSig = {
            sig: JSON.stringify({ ProofOfPossession: blsCombinedSignature }),
            algo: 'LIT_BLS',
            derivedVia: 'lit.bls',
            signedMessage,
            address: computeAddress(_pkpPublicKey),
          };

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
          version: string,
          jitContext: NagaJitContext
        ) => {
          const nodeUrls = requestBody.nodeSet.map(
            (node) => `${httpProtocol}${node.socketAddress}`
          );

          const requests: RequestItem<
            z.infer<typeof EncryptedVersion1Schema>
          >[] = [];
          const _requestId = createRequestId();

          for (const url of nodeUrls) {
            const _requestData = {
              sessionKey: requestBody.sessionKey,
              authMethods: [],
              pkpPublicKey: requestBody.pkpPublicKey,
              siweMessage: requestBody.siweMessage,
              curveType: 'BLS' as const,
              epoch: requestBody.epoch,
              nodeSet: requestBody.nodeSet,
              litActionCode: requestBody.litActionCode,
              litActionIpfsId: requestBody.litActionIpfsId,
              jsParams: requestBody.jsParams,
              maxPrice: getUserMaxPrice({
                product: 'SIGN_SESSION_KEY',
              }).toString(),
            };

            const encryptedPayload = E2EERequestManager.encryptRequestData(
              _requestData,
              url,
              jitContext
            );

            const _urlWithPath = composeLitUrl({
              url,
              endpoint: baseModule.getEndpoints().SIGN_SESSION_KEY,
            });
            requests.push({
              fullPath: _urlWithPath,
              data: encryptedPayload,
              requestId: _requestId,
              epoch: requestBody.epoch,
              version: version,
            });
          }

          return requests;
        },
        handleResponse: async (
          result: z.infer<typeof GenericEncryptedPayloadSchema>,
          pkpPublicKey: Hex | string,
          jitContext: NagaJitContext,
          requestId?: string
        ) => {
          if (!result.success) {
            E2EERequestManager.handleEncryptedError(
              result,
              jitContext,
              'Sign Custom Session Key'
            );
          }

          const decryptedValues = E2EERequestManager.decryptBatchResponse(
            result,
            jitContext,
            (decryptedJson) => {
              const signCustomSessionKeyData = decryptedJson.data;
              if (!signCustomSessionKeyData) {
                throw new Error(
                  `[${requestId}] Decrypted response missing data field`
                );
              }
              return signCustomSessionKeyData;
            }
          );

          const values = decryptedValues;
          const signatureShares = values.map((s) => ({
            ProofOfPossession: {
              identifier: s.signatureShare.ProofOfPossession.identifier,
              value: s.signatureShare.ProofOfPossession.value,
            },
          }));

          const blsCombinedSignature = await combineSignatureShares(
            signatureShares
          );
          const _pkpPublicKey = HexPrefixedSchema.parse(pkpPublicKey);
          const mostCommonSiweMessage = mostCommonString(
            values.map((s) => s.siweMessage)
          );
          const signedMessage = normalizeAndStringify(mostCommonSiweMessage!);

          const authSig: AuthSig = {
            sig: JSON.stringify({ ProofOfPossession: blsCombinedSignature }),
            algo: 'LIT_BLS',
            derivedVia: 'lit.bls',
            signedMessage,
            address: computeAddress(_pkpPublicKey),
          };

          return authSig;
        },
      },

      /**
       * Execute JS API - shared implementation
       */
      executeJs: {
        schemas: {
          Input: ExecuteJsInputSchema,
          RequestData: ExecuteJsRequestDataSchema,
          ResponseData: ExecuteJsResponseDataSchema,
        },
        createRequest: async (params: ExecuteJsCreateRequestParams) => {
          _logger.info(
            {
              hasCode: !!params.executionContext.code,
              hasIpfsId: !!params.executionContext.ipfsId,
              hasJsParams: !!params.executionContext.jsParams,
              responseStrategy: params.responseStrategy?.strategy || 'default',
            },
            'executeJs:createRequest: Creating request'
          );

          // Store response strategy for later use in handleResponse
          executeJsResponseStrategy = params.responseStrategy;

          // Generate session sigs
          const sessionSigs = await issueSessionFromContext({
            pricingContext: PricingContextSchema.parse(params.pricingContext),
            authContext: params.authContext,
          });

          // Generate requests
          const _requestId = createRequestId();
          const requests: RequestItem<
            z.infer<typeof EncryptedVersion1Schema>
          >[] = [];
          const urls = Object.keys(sessionSigs);

          for (const url of urls) {
            // Base64 encode the code if provided
            let encodedCode: string | undefined;
            if (params.executionContext.code) {
              encodedCode = Buffer.from(
                params.executionContext.code,
                'utf-8'
              ).toString('base64');
            }

            const _requestData = ExecuteJsRequestDataSchema.parse({
              authSig: sessionSigs[url],
              nodeSet: urls,
              ...(encodedCode && { code: encodedCode }),
              ...(params.executionContext.ipfsId && {
                ipfsId: params.executionContext.ipfsId,
              }),
              ...(params.executionContext.jsParams && {
                jsParams: { jsParams: params.executionContext.jsParams },
              }),
            });

            const encryptedPayload = E2EERequestManager.encryptRequestData(
              _requestData,
              url,
              params.jitContext
            );

            const _urlWithPath = composeLitUrl({
              url,
              endpoint: baseModule.getEndpoints().EXECUTE_JS,
            });

            requests.push({
              fullPath: _urlWithPath,
              data: encryptedPayload,
              requestId: _requestId,
              epoch: params.connectionInfo.epochState.currentNumber,
              version: params.version,
            });
          }

          return requests;
        },
        handleResponse: async (
          result: z.infer<typeof GenericEncryptedPayloadSchema>,
          requestId: string,
          jitContext: NagaJitContext
        ) => {
          _logger.info(
            {
              requestId,
              responseStrategy:
                executeJsResponseStrategy?.strategy || 'default',
            },
            'executeJs:handleResponse: Processing executeJs response'
          );

          if (!result.success) {
            E2EERequestManager.handleEncryptedError(
              result,
              jitContext,
              'JS execution'
            );
          }

          const decryptedResponseValues =
            E2EERequestManager.decryptBatchResponse(
              result,
              jitContext,
              (decryptedJson) => {
                const executeJsData = decryptedJson.data;
                if (!executeJsData) {
                  throw new Error('Decrypted response missing data field');
                }
                return executeJsData;
              }
            );

          const batchResponseData = {
            success: true,
            values: decryptedResponseValues,
          };

          const correctProcessedResult: ProcessedBatchResult<
            z.infer<typeof ExecuteJsResponseDataSchema>
          > = {
            success: true as const,
            values: [batchResponseData],
          };

          const executeJsResponse = await handleExecuteJsResponse(
            correctProcessedResult,
            requestId,
            networkConfig.minimumThreshold,
            executeJsResponseStrategy
          );

          return executeJsResponse;
        },
      },
    },
    /**
     * Returns a wrapped module instance with runtime overrides while keeping the base immutable.
     * Currently supports overriding the RPC URL used by consumers of this module.
     *
     * @param overrides - The overrides to apply to the module.
     * @returns A wrapped module instance with the overrides applied.
     * @example
     *
     * import { nagaDev } from '@lit-protocol/networks';
     * const nagaDevWithOverride = nagaDev.withOverrides({ rpcUrl: 'https://custom-rpc-url.com' });
     * const litClient = await createLitClient({ network: nagaDevWithOverride });
     */
    withOverrides: (overrides: { rpcUrl?: string }) => {
      const resolvedRpcUrl = overrides.rpcUrl ?? baseModule.getRpcUrl();

      // Build an overridden network config and a chain manager bound to it
      const overriddenChainConfig = {
        ...networkConfig.chainConfig,
        rpcUrls: {
          ...networkConfig.chainConfig.rpcUrls,
          default: {
            ...networkConfig.chainConfig.rpcUrls.default,
            http: [resolvedRpcUrl],
          },
          ['public']: {
            ...(networkConfig.chainConfig.rpcUrls as any)['public'],
            http: [resolvedRpcUrl],
          },
        },
      } as typeof networkConfig.chainConfig;

      const overriddenNetworkConfig = {
        ...networkConfig,
        rpcUrl: resolvedRpcUrl,
        chainConfig: overriddenChainConfig,
      } as typeof networkConfig;

      const createChainManagerOverridden = (
        account: ExpectedAccountOrWalletClient
      ) => createChainManagerFactory(overriddenNetworkConfig, account);

      // Rebuild a fresh module bound to the overridden config
      return createBaseModule({
        networkConfig: overriddenNetworkConfig,
        moduleName,
        createChainManager: createChainManagerOverridden,
        verifyReleaseId: baseModule.getVerifyReleaseId(),
      });
    },
  };

  return baseModule;
}
