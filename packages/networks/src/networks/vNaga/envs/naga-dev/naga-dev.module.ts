import { DEV_PRIVATE_KEY, version } from '@lit-protocol/constants';
import { verifyAndDecryptWithSignatureShares } from '@lit-protocol/crypto';
import {
  AuthData,
  EncryptedVersion1Schema,
  GenericEncryptedPayloadSchema,
  GenericResultBuilder,
  HexPrefixedSchema,
  JsonSignCustomSessionKeyRequestForPkpReturnSchema,
  JsonSignSessionKeyRequestForPkpReturnSchema,
} from '@lit-protocol/schemas';
import { Hex, hexToBytes, stringToBytes } from 'viem';

import { z } from 'zod';
import { LitNetworkModuleBase } from '../../../types';
import type { ExpectedAccountOrWalletClient } from '../../LitChainClient/contract-manager/createContractsManager';
import { networkConfig } from './naga-dev.config';
import { PricingContextSchema } from './pricing-manager/PricingContextSchema';
import { issueSessionFromContext } from './session-manager/issueSessionFromContext';
import { createStateManager } from './state-manager/createStateManager';

// Import the necessary types for the explicit return type annotation
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
import { createRequestId } from '../../../shared/helpers/createRequestId';
import { handleAuthServerRequest } from '../../../shared/helpers/handleAuthServerRequest';
import { composeLitUrl } from '../../endpoints-manager/composeLitUrl';
import {
  getNodePrices,
  PKPPermissionsManager,
} from '../../LitChainClient/apis/highLevelApis';
import { PaymentManager } from '../../LitChainClient/apis/highLevelApis/PaymentManager/PaymentManager';
import { MintWithMultiAuthsRequest } from '../../LitChainClient/apis/highLevelApis/mintPKP/mintWithMultiAuths';
import { PkpIdentifierRaw } from '../../LitChainClient/apis/rawContractApis/permissions/utils/resolvePkpTokenId';
import type { GenericTxRes, LitTxRes } from '../../LitChainClient/apis/types';
import type { PKPData } from '../../LitChainClient/schemas/shared/PKPDataSchema';
import { ConnectionInfo } from '../../LitChainClient/types';
import { DecryptCreateRequestParams } from './api-manager/decrypt/decrypt.CreateRequestParams';
import { DecryptInputSchema } from './api-manager/decrypt/decrypt.InputSchema';
import { DecryptRequestDataSchema } from './api-manager/decrypt/decrypt.RequestDataSchema';
import { DecryptResponseDataSchema } from './api-manager/decrypt/decrypt.ResponseDataSchema';
import { E2EERequestManager } from './api-manager/e2ee-request-manager/E2EERequestManager';
import { handleResponse as handleExecuteJsResponse } from './api-manager/executeJs';
import { ExecuteJsCreateRequestParams } from './api-manager/executeJs/executeJs.CreateRequestParams';
import { ExecuteJsInputSchema } from './api-manager/executeJs/executeJs.InputSchema';
import { ExecuteJsRequestDataSchema } from './api-manager/executeJs/executeJs.RequestDataSchema';
import { ExecuteJsResponseDataSchema } from './api-manager/executeJs/executeJs.ResponseDataSchema';
import { RawHandshakeResponseSchema } from './api-manager/handshake/handshake.schema';
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
import { getMaxPricesForNodeProduct } from './pricing-manager/getMaxPricesForNodeProduct';
import { getUserMaxPrice } from './pricing-manager/getUserMaxPrice';
import { privateKeyToAccount } from 'viem/accounts';

const MODULE_NAME = 'naga-dev';

const _logger = getChildLogger({
  module: `${MODULE_NAME}-module`,
});

// Release verification types and constants
interface ReleaseInfo {
  status: number;
  env: number;
  typ: number;
  platform: number;
  options: { asU32: () => number };
  publicKey: Uint8Array;
  idKeyDigest: Uint8Array;
}

enum ReleaseStatus {
  Null = 0,
  Active = 1,
  Inactive = 2,
}

// Basic Release Register Contract ABI - only the functions we need
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

/**
 * Extract release ID from attestation data
 * @param attestation The node attestation containing release ID
 * @returns The release ID string
 */
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

/**
 * Extract subnet ID from release ID
 * Based on the Rust implementation: subnet_id_from_release_id
 * @param releaseId The release ID string
 * @returns The subnet ID
 */
function getSubnetIdFromReleaseId(releaseId: string): string {
  // In the Rust code, this extracts the subnet ID from the release ID
  // For now, this is a simplified version - you may need to adjust based on actual format
  const parts = releaseId.split('-');
  if (parts.length < 2) {
    throw new NetworkError(
      { info: { releaseId } },
      'Invalid release ID format'
    );
  }
  return parts[0]; // First part is typically the subnet ID
}

/**
 * Pad release ID to 32 bytes for contract call
 * @param releaseId The release ID string
 * @returns Padded bytes32 for contract call
 */
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

/**
 * Verify release ID against the on-chain release register contract
 * This function is provided to the crypto package for dependency injection
 * @param attestation The node attestation
 * @param config Configuration for release verification
 */
const verifyReleaseId = async (
  attestation: NodeAttestation,
  config: ReleaseVerificationConfig
): Promise<void> => {
  _logger.info('verifyReleaseId: Starting release verification', {
    subnetId: config.subnetId,
    environment: config.environment,
  });

  // 1. Extract release ID from attestation
  const releaseId = extractReleaseId(attestation);

  // 2. Verify release ID length
  if (releaseId.length !== 64) {
    // RELEASE_ID_STR_LEN from Rust code
    throw new NetworkError(
      {
        info: { releaseId, expectedLength: 64, actualLength: releaseId.length },
      },
      `Release ID length is incorrect: expected 64, got ${releaseId.length}`
    );
  }

  // 3. Extract and verify subnet ID
  const releaseSubnetId = getSubnetIdFromReleaseId(releaseId);
  if (releaseSubnetId !== config.subnetId) {
    throw new NetworkError(
      { info: { releaseSubnetId, expectedSubnetId: config.subnetId } },
      `Subnet ID mismatch: expected ${config.subnetId}, got ${releaseSubnetId}`
    );
  }

  // 4. Query the release register contract
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

    // 5. Verify release status is active
    if (release.status !== ReleaseStatus.Active) {
      throw new NetworkError(
        { info: { releaseId, status: release.status } },
        `Release is not active: status ${release.status}`
      );
    }

    // 6. Verify environment matches
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

    _logger.info('verifyReleaseId: Release verification successful', {
      releaseId,
      status: release.status,
      environment: release.env,
    });
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

// Store response strategy separately for executeJs requests
let executeJsResponseStrategy: LitActionResponseStrategy | undefined;

// Store secret keys for PKP sign requests to use in handleResponse
// const globalPkpSignSecretKeys: Record<string, Record<string, Uint8Array>> = {};
// const globalPkpSignNodeKeys: Record<string, Record<string, string>> = {};

// Define ProcessedBatchResult type (mirroring structure from dispatchRequests)
type ProcessedBatchResult<T> =
  | { success: true; values: T[] }
  | { success: false; error: any; failedNodeUrls?: string[] };

// Define the object first
const networkModuleObject = {
  id: 'naga',
  version: `${version}-naga-dev`,
  config: {
    requiredAttestation: false,
    abortTimeout: 20_000,
    minimumThreshold: networkConfig.minimumThreshold,
    httpProtocol: networkConfig.httpProtocol,
  },
  schemas: {
    GenericResponseSchema: GenericResultBuilder,
  },
  getNetworkName: () => networkConfig.network,
  getHttpProtocol: () => networkConfig.httpProtocol,
  getEndpoints: () => networkConfig.endpoints,
  getRpcUrl: () => networkConfig.rpcUrl,
  getChainConfig: () => networkConfig.chainConfig,
  getDefaultAuthServiceBaseUrl: () => networkConfig.services.authServiceBaseUrl,
  getDefaultLoginBaseUrl: () => networkConfig.services.loginServiceBaseUrl,
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
  getVerifyReleaseId: () => verifyReleaseId,
  chainApi: {
    getPKPPermissionsManager: async (params: {
      pkpIdentifier: PkpIdentifierRaw;
      account: ExpectedAccountOrWalletClient;
    }): Promise<PKPPermissionsManager> => {
      const chainManager = createChainManager(params.account);
      return chainManager.api.pkpPermissionsManager(params.pkpIdentifier);
    },

    /**
     * Gets a PaymentManager instance for managing deposits, withdrawals, and balance queries
     */
    getPaymentManager: async (params: {
      account: ExpectedAccountOrWalletClient;
    }): Promise<PaymentManager> => {
      const chainManager = createChainManager(params.account);
      return chainManager.api.paymentManager();
    },

    /**
     * Gets all PKPs associated with specific authentication data
     */
    getPKPsByAuthData: async (params: {
      authData: {
        authMethodType: number | bigint;
        authMethodId: string;
        accessToken?: string;
      };
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

    /**
     * Gets all PKPs owned by a specific address
     */
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

    /**
     * Mints a PKP using EOA directly
     */
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
      authServiceBaseUrl?: string;
      scopes?: ('sign-anything' | 'personal-sign' | 'no-permissions')[];
    }) => {
      return await handleAuthServerRequest<PKPData>({
        jobName: 'PKP Minting',
        serverUrl:
          params.authServiceBaseUrl ||
          networkConfig.services.authServiceBaseUrl,
        path: '/pkp/mint',
        body: {
          authMethodType: params.authData.authMethodType,
          authMethodId: params.authData.authMethodId,
          pubkey: params.authData.publicKey,
          scopes: params.scopes,
        },
      });
    },
  },
  api: {
    /**
     * The Lit Client and Network Module exchange data in a request-response cycle:
     *
     * 1. 🟪 The Network Module constructs the request.
     * 2. 🟩 The Lit Client sends it to the Lit Network.
     * 3. 🟪 The Network Module processes the response.
     *
     * In some cases, we need to maintain a piece of state that is relevant to both step 1 (request creation)
     * and step 3 (response handling). To support this, we introduce a *network-specific context object*
     * that can be passed between the Lit Client and Network Module.
     *
     * One key example is managing a just-in-time (JIT) state for ephemeral secrets or signing keys
     * — such as those used in PKP signing — which must persist across the request lifecycle.
     */
    createJitContext: async (
      connectionInfo: ConnectionInfo,
      handshakeResult: OrchestrateHandshakeResponse
    ): Promise<NagaJitContext> => {
      const keySet: KeySet = {};

      // 1. Generate a key set for the JIT context
      for (const url of connectionInfo.bootstrapUrls) {
        keySet[url] = {
          publicKey: hexToBytes(
            HexPrefixedSchema.parse(
              handshakeResult.serverKeys[url].nodeIdentityKey
            ) as `0x${string}`
          ),
          secretKey: nacl.box.keyPair().secretKey,
        };
      }

      // Use read-only account for viewing PKPs
      const account = privateKeyToAccount(
        DEV_PRIVATE_KEY
      );

      // 2. Fetch the price feed info
      const nodePrices = await getNodePrices(
        {
          realmId: 1,
          networkCtx: networkConfig,
        },
        account
      );

      return { keySet, nodePrices };
    },
    handshake: {
      schemas: {
        Input: {
          ResponseData: RawHandshakeResponseSchema,
        },
      },
    },
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

        const requests: RequestItem<z.infer<typeof EncryptedVersion1Schema>>[] =
          [];

        _logger.info('pkpSign:createRequest: Request id generated');

        const urls = Object.keys(sessionSigs);

        // // Reset and store secret keys for this request
        // globalPkpSignSecretKeys[_requestId] = {};
        // globalPkpSignNodeKeys[_requestId] = {};

        for (const url of urls) {
          _logger.info('pkpSign:createRequest: Generating request data', {
            url,
          });

          const _requestData = PKPSignRequestDataSchema.parse({
            toSign: Array.from(params.signingContext.toSign),
            signingScheme: params.signingContext.signingScheme,
            pubkey: params.signingContext.pubKey,
            authSig: sessionSigs[url],
            nodeSet: urls,

            // additional meta to determine hash function, but not
            // sent to the node
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
            endpoint: networkModuleObject.getEndpoints().PKP_SIGN,
          });

          _logger.info('pkpSign:createRequest: Url with path generated', {
            _urlWithPath,
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
          _logger.error(
            'pkpSign:createRequest: No requests generated for pkpSign.'
          );
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
            // Extract the actual PKP sign data from the response wrapper
            const pkpSignData = decryptedJson.data;
            if (!pkpSignData) {
              throw new Error('Decrypted response missing data field');
            }

            // Validate with schema - wrap in expected format
            const wrappedData = {
              success: pkpSignData.success,
              values: [pkpSignData], // Wrap the individual response in an array
            };

            const responseData = PKPSignResponseDataSchema.parse(wrappedData);
            return responseData.values[0]; // Return the individual PKP sign response
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
        const requests: RequestItem<z.infer<typeof EncryptedVersion1Schema>>[] =
          [];

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
            unifiedAccessControlConditions:
              params.unifiedAccessControlConditions,
            authSig: sessionSigs[url],
            chain: params.chain,
          });

          // Encrypt the request data using the generic encryption function
          const encryptedPayload = E2EERequestManager.encryptRequestData(
            _requestData,
            url,
            params.jitContext
          );

          const _urlWithPath = composeLitUrl({
            url,
            endpoint: networkModuleObject.getEndpoints().ENCRYPTION_SIGN,
          });

          _logger.info('decrypt:createRequest: Url with path generated', {
            _urlWithPath,
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
          _logger.error(
            'decrypt:createRequest: No requests generated for decrypt.'
          );
          throw new Error('Failed to generate requests for decrypt.');
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
        _logger.info('decrypt:handleResponse: Processing decrypt response', {
          requestId,
        });

        // Check if the result indicates failure before attempting decryption
        if (!result.success) {
          E2EERequestManager.handleEncryptedError(
            result,
            jitContext,
            'Decryption'
          );
        }

        // Decrypt the batch response using the E2EE manager
        const decryptedValues = E2EERequestManager.decryptBatchResponse(
          result,
          jitContext,
          (decryptedJson) => {
            // Extract the actual decrypt data from the response wrapper
            const decryptData = decryptedJson.data;
            if (!decryptData) {
              throw new Error('Decrypted response missing data field');
            }

            // Validate with schema
            const responseData = DecryptResponseDataSchema.parse(decryptData);
            return responseData;
          }
        );

        _logger.info('decrypt:handleResponse: Values decrypted', {
          valueCount: decryptedValues.length,
        });

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

        _logger.info('decrypt:handleResponse: Signature shares extracted', {
          signatureShares,
        });

        // Verify and decrypt using signature shares
        const decryptedData = await verifyAndDecryptWithSignatureShares(
          subnetPubKey,
          stringToBytes(identityParam),
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
        version: string,
        jitContext: NagaJitContext
      ) => {
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

        const requests: RequestItem<z.infer<typeof EncryptedVersion1Schema>>[] =
          [];
        const _requestId = createRequestId();

        for (const url of nodeUrls) {
          _logger.info(
            'signSessionKey:createRequest: Generating request data',
            {
              url,
            }
          );

          // Create the request data that will be encrypted
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

          // Encrypt the request data using the E2EE manager
          const encryptedPayload = E2EERequestManager.encryptRequestData(
            _requestData,
            url,
            jitContext
          );

          const _urlWithPath = composeLitUrl({
            url,
            endpoint: networkModuleObject.getEndpoints().SIGN_SESSION_KEY,
          });

          _logger.info(
            'signSessionKey:createRequest: Url with path generated',
            {
              _urlWithPath,
            }
          );

          requests.push({
            fullPath: _urlWithPath,
            data: encryptedPayload,
            requestId: _requestId,
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
        result: z.infer<typeof GenericEncryptedPayloadSchema>,
        pkpPublicKey: Hex | string,
        jitContext: NagaJitContext
      ) => {
        _logger.info(
          'signSessionKey:handleResponse: Processing signSessionKey response'
        );

        if (!result.success) {
          E2EERequestManager.handleEncryptedError(
            result,
            jitContext,
            'Session key signing'
          );
        }

        // Decrypt the batch response using the E2EE manager
        const decryptedValues = E2EERequestManager.decryptBatchResponse(
          result,
          jitContext,
          (decryptedJson) => {
            // The signSessionKey response is directly the individual response object,
            // not wrapped in a { success, values } structure like other APIs
            const signSessionKeyData = decryptedJson.data;
            if (!signSessionKeyData) {
              throw new Error('Decrypted response missing data field');
            }

            // The signSessionKey response is the individual response, return it directly
            return signSessionKeyData;
          }
        );

        _logger.info('signSessionKey:handleResponse: Values decrypted', {
          valueCount: decryptedValues.length,
        });

        // The decrypted values are already the individual signSessionKey responses
        const values = decryptedValues;

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
        version: string,
        jitContext: NagaJitContext
      ) => {
        _logger.info('signCustomSessionKey:createRequest: Request body', {
          requestBody,
        });

        const nodeUrls = requestBody.nodeSet.map(
          (node) => `${httpProtocol}${node.socketAddress}`
        );

        _logger.info('signCustomSessionKey:createRequest: Node urls', {
          nodeUrls,
        });

        const requests: RequestItem<z.infer<typeof EncryptedVersion1Schema>>[] =
          [];
        const _requestId = createRequestId();

        for (const url of nodeUrls) {
          _logger.info(
            'signCustomSessionKey:createRequest: Generating request data',
            {
              url,
            }
          );

          // Create the request data that will be encrypted
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
          };

          // Encrypt the request data using the E2EE manager
          const encryptedPayload = E2EERequestManager.encryptRequestData(
            _requestData,
            url,
            jitContext
          );

          const _urlWithPath = composeLitUrl({
            url,
            endpoint: networkModuleObject.getEndpoints().SIGN_SESSION_KEY,
          });

          _logger.info(
            'signCustomSessionKey:createRequest: Url with path generated',
            {
              _urlWithPath,
            }
          );

          requests.push({
            fullPath: _urlWithPath,
            data: encryptedPayload,
            requestId: _requestId,
            epoch: requestBody.epoch,
            version: version,
          });
        }

        if (!requests || requests.length === 0) {
          _logger.error(
            'signCustomSessionKey:createRequest: No requests generated for signCustomSessionKey.'
          );
          throw new Error(
            'Failed to generate requests for signCustomSessionKey.'
          );
        }

        return requests;
      },
      handleResponse: async (
        result: z.infer<typeof GenericEncryptedPayloadSchema>,
        pkpPublicKey: Hex | string,
        jitContext: NagaJitContext
      ) => {
        _logger.info(
          'signCustomSessionKey:handleResponse: Processing signCustomSessionKey response'
        );

        // Check if the result indicates failure but has an encrypted error payload
        if (!result.success) {
          E2EERequestManager.handleEncryptedError(
            result,
            jitContext,
            'Session key signing'
          );
        }

        // Decrypt the batch response using the E2EE manager
        const decryptedValues = E2EERequestManager.decryptBatchResponse(
          result,
          jitContext,
          (decryptedJson) => {
            // The signCustomSessionKey response is directly the individual response object,
            // not wrapped in a { success, values } structure like other APIs
            const signCustomSessionKeyData = decryptedJson.data;
            if (!signCustomSessionKeyData) {
              throw new Error('Decrypted response missing data field');
            }

            // The signCustomSessionKey response is the individual response, return it directly
            return signCustomSessionKeyData;
          }
        );

        _logger.info('signCustomSessionKey:handleResponse: Values decrypted', {
          valueCount: decryptedValues.length,
        });

        // The decrypted values are already the individual signCustomSessionKey responses
        const values = decryptedValues;

        _logger.info('signCustomSessionKey:handleResponse: Values', {
          values,
        });

        const signatureShares = values.map((s) => ({
          ProofOfPossession: {
            identifier: s.signatureShare.ProofOfPossession.identifier,
            value: s.signatureShare.ProofOfPossession.value,
          },
        }));

        _logger.info('signCustomSessionKey:handleResponse: Signature shares', {
          signatureShares,
        });

        // naga-wasm
        // datil-wasm (we could use the existing package for this or
        // we should make the current wasm work with Datil too.)
        const blsCombinedSignature = await combineSignatureShares(
          signatureShares
        );

        _logger.info(
          'signCustomSessionKey:handleResponse: BLS combined signature',
          {
            blsCombinedSignature,
          }
        );

        const _pkpPublicKey = HexPrefixedSchema.parse(pkpPublicKey);

        const mostCommonSiweMessage = mostCommonString(
          values.map((s) => s.siweMessage)
        );

        const signedMessage = normalizeAndStringify(mostCommonSiweMessage!);

        _logger.info('signCustomSessionKey:handleResponse: Signed message', {
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

        _logger.info('signCustomSessionKey:handleResponse: Auth sig', {
          authSig,
        });

        return authSig;
      },
    },
    executeJs: {
      schemas: {
        Input: ExecuteJsInputSchema,
        RequestData: ExecuteJsRequestDataSchema,
        ResponseData: ExecuteJsResponseDataSchema,
      },
      createRequest: async (params: ExecuteJsCreateRequestParams) => {
        _logger.info('executeJs:createRequest: Creating request', {
          hasCode: !!params.executionContext.code,
          hasIpfsId: !!params.executionContext.ipfsId,
          hasJsParams: !!params.executionContext.jsParams,
          responseStrategy: params.responseStrategy?.strategy || 'default',
        });

        // Store response strategy for later use in handleResponse
        executeJsResponseStrategy = params.responseStrategy;

        // -- 1. generate session sigs
        const sessionSigs = await issueSessionFromContext({
          pricingContext: PricingContextSchema.parse(params.pricingContext),
          authContext: params.authContext,
        });

        _logger.info('executeJs:createRequest: Session sigs generated');

        // -- 2. generate requests
        const _requestId = createRequestId();
        const requests: RequestItem<z.infer<typeof EncryptedVersion1Schema>>[] =
          [];

        _logger.info('executeJs:createRequest: Request id generated');

        const urls = Object.keys(sessionSigs);

        for (const url of urls) {
          _logger.info('executeJs:createRequest: Generating request data', {
            url,
          });

          // Base64 encode the code if provided
          let encodedCode: string | undefined;
          if (params.executionContext.code) {
            encodedCode = Buffer.from(
              params.executionContext.code,
              'utf-8'
            ).toString('base64');
            _logger.info('executeJs:createRequest: Code encoded to base64', {
              originalLength: params.executionContext.code.length,
              encodedLength: encodedCode.length,
            });
          }

          // Build the request data that gets sent to the nodes
          const _requestData = ExecuteJsRequestDataSchema.parse({
            authSig: sessionSigs[url],
            nodeSet: urls,
            ...(encodedCode && { code: encodedCode }),
            ...(params.executionContext.ipfsId && {
              ipfsId: params.executionContext.ipfsId,
            }),
            ...(params.executionContext.jsParams && {
              jsParams: {
                jsParams: params.executionContext.jsParams,
              },
            }),
          });

          // Encrypt the request data using the E2EE manager
          const encryptedPayload = E2EERequestManager.encryptRequestData(
            _requestData,
            url,
            params.jitContext
          );

          const _urlWithPath = composeLitUrl({
            url,
            endpoint: networkModuleObject.getEndpoints().EXECUTE_JS,
          });

          _logger.info('executeJs:createRequest: Url with path generated', {
            _urlWithPath,
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
          _logger.error(
            'executeJs:createRequest: No requests generated for executeJs.'
          );
          throw new Error('Failed to generate requests for executeJs.');
        }

        return requests;
      },
      handleResponse: async (
        result: z.infer<typeof GenericEncryptedPayloadSchema>,
        requestId: string,
        jitContext: NagaJitContext
      ) => {
        _logger.info(
          'executeJs:handleResponse: Processing executeJs response',
          {
            requestId,
            responseStrategy: executeJsResponseStrategy?.strategy || 'default',
          }
        );

        // Check if the result indicates failure before attempting decryption
        if (!result.success) {
          E2EERequestManager.handleEncryptedError(
            result,
            jitContext,
            'JS execution'
          );
        }

        // Decrypt the batch response using the E2EE manager
        const decryptedResponseValues = E2EERequestManager.decryptBatchResponse(
          result,
          jitContext,
          (decryptedJson) => {
            // Extract the actual executeJs response data from the response wrapper
            const executeJsData = decryptedJson.data;
            if (!executeJsData) {
              throw new Error('Decrypted response missing data field');
            }

            return executeJsData; // Return the executeJs response directly
          }
        );

        // The decryptedResponseValues are individual response objects with the correct fields
        // Wrap them in the expected batch result format
        const batchResponseData = {
          success: true,
          values: decryptedResponseValues, // These are the individual executeJs responses
        };

        // Create the correctly structured ProcessedBatchResult for handleExecuteJsResponse
        const correctProcessedResult: ProcessedBatchResult<
          z.infer<typeof ExecuteJsResponseDataSchema>
        > = {
          success: true as const,
          values: [batchResponseData], // batchResponseData is the ExecuteJsResponseDataSchema structure
        };

        // Use the handleResponse from the executeJs module with response strategy
        const executeJsResponse = await handleExecuteJsResponse(
          correctProcessedResult,
          requestId,
          networkConfig.minimumThreshold,
          executeJsResponseStrategy
        );

        _logger.info(
          'executeJs:handleResponse: ExecuteJs response processed successfully',
          {
            requestId,
            hasSignatures:
              !!executeJsResponse.signatures &&
              Object.keys(executeJsResponse.signatures).length > 0,
            hasResponse: !!executeJsResponse.response,
            hasClaims:
              !!executeJsResponse.claims &&
              Object.keys(executeJsResponse.claims).length > 0,
          }
        );

        return executeJsResponse;
      },
    },
  },
};

// Now define the type by taking the type of the object, but overriding getChainManager
export type NagaDevModule = Omit<
  typeof networkModuleObject,
  'getChainManager'
> & {
  getChainManager: (
    accountOrWalletClient: ExpectedAccountOrWalletClient
  ) => CreateChainManagerReturn;
};

// Export the correctly typed object
export const nagaDevModule = networkModuleObject as NagaDevModule;
