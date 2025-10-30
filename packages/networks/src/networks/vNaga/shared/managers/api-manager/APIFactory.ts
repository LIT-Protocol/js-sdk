import { getChildLogger } from '@lit-protocol/logger';
import { z } from 'zod';
import {
  EncryptedVersion1Schema,
  GenericEncryptedPayloadSchema,
  GenericResultBuilder,
} from '@lit-protocol/schemas';
import { RequestItem, NagaJitContext, AuthSig } from '@lit-protocol/types';
import { NodeError, UnknownError } from '@lit-protocol/constants';

import { E2EERequestManager } from './e2ee-request-manager/E2EERequestManager';
import { composeLitUrl } from '../endpoints-manager/composeLitUrl';
import { createRequestId } from '../../helpers/createRequestId';
import { issueSessionFromContext } from '../session-manager/issueSessionFromContext';
import { PricingContextSchema } from '../pricing-manager/schema';
import { combinePKPSignSignatures } from './helper/get-signatures';

import type { INetworkConfig } from '../../interfaces/NetworkContext';
import type { PKPSignCreateRequestParams } from './pkpSign/pkpSign.CreateRequestParams';
import type { DecryptCreateRequestParams } from './decrypt/decrypt.CreateRequestParams';
import type { ExecuteJsCreateRequestParams } from './executeJs/executeJs.CreateRequestParams';

import { PKPSignRequestDataSchema } from './pkpSign/pkpSign.RequestDataSchema';
import { PKPSignResponseDataSchema } from './pkpSign/pkpSign.ResponseDataSchema';
import { DecryptRequestDataSchema } from './decrypt/decrypt.RequestDataSchema';
import { DecryptResponseDataSchema } from './decrypt/decrypt.ResponseDataSchema';
import { ExecuteJsRequestDataSchema } from './executeJs/executeJs.RequestDataSchema';
import { ExecuteJsResponseDataSchema } from './executeJs/executeJs.ResponseDataSchema';

const _logger = getChildLogger({
  module: 'APIFactory',
});

export function createPKPSignAPI<T, M>(networkConfig: INetworkConfig<T, M>) {
  return {
    createRequest: async (
      params: PKPSignCreateRequestParams
    ): Promise<RequestItem<z.infer<typeof EncryptedVersion1Schema>>[]> => {
      _logger.info({ params }, 'pkpSign:createRequest: Creating request');

      // Generate or reuse session sigs
      let sessionSigs: Record<string, AuthSig>;
      if ('sessionSigs' in params && params.sessionSigs) {
        sessionSigs = params.sessionSigs;
      } else {
        const pricingContext = PricingContextSchema.parse(
          params.pricingContext
        );
        sessionSigs = await issueSessionFromContext({
          pricingContext,
          authContext: params.authContext,
          delegationAuthSig: params.delegationAuthSig,
        });
      }

      _logger.info('pkpSign:createRequest: Session sigs generated');

      // Generate requests
      const _requestId = createRequestId();
      const requests: RequestItem<z.infer<typeof EncryptedVersion1Schema>>[] =
        [];
      const urls = Object.keys(sessionSigs);

      for (const url of urls) {
        _logger.info({ url }, 'pkpSign:createRequest: Generating request data');

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
          endpoint: networkConfig.endpoints.PKP_SIGN,
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
        throw new UnknownError(
          {
            cause: new Error('Request generation produced no entries'),
            info: {
              operation: 'pkpSign:createRequest',
              requestId: _requestId,
            },
          },
          'Failed to generate requests for pkpSign.'
        );
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
          'PKP Sign',
          requestId
        );
      }

      const decryptedValues = E2EERequestManager.decryptBatchResponse(
        result,
        jitContext,
        (decryptedJson) => {
          const pkpSignData = decryptedJson.data;
          if (!pkpSignData) {
            throw new NodeError(
              {
                cause: new Error('Decrypted response missing data field'),
                info: {
                  operationName: 'PKP Sign',
                  requestId,
                },
              },
              `PKP Sign failed for request ${requestId}. Decrypted response missing data field`
            );
          }

          const wrappedData = {
            success: pkpSignData.success,
            values: [pkpSignData],
          };

          const responseData = PKPSignResponseDataSchema.parse(wrappedData);
          return responseData.values[0];
        },
        {
          operationName: 'PKP Sign',
          requestId,
        }
      );

      const signatures = await combinePKPSignSignatures({
        nodesPkpSignResponseData: decryptedValues,
        requestId,
        threshold: networkConfig.minimumThreshold,
      });

      return signatures;
    },
  };
}

export function createDecryptAPI<T, M>(networkConfig: INetworkConfig<T, M>) {
  return {
    createRequest: async (params: DecryptCreateRequestParams) => {
      _logger.info({ params }, 'decrypt:createRequest: Creating request');

      // Generate session sigs for decrypt
      const sessionSigs = await issueSessionFromContext({
        pricingContext: PricingContextSchema.parse(params.pricingContext),
        authContext: params.authContext,
      });

      const _requestId = createRequestId();
      const requests: RequestItem<z.infer<typeof EncryptedVersion1Schema>>[] =
        [];
      const urls = Object.keys(sessionSigs);

      for (const url of urls) {
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

        const encryptedPayload = E2EERequestManager.encryptRequestData(
          _requestData,
          url,
          params.jitContext
        );

        const _urlWithPath = composeLitUrl({
          url,
          endpoint: networkConfig.endpoints.ENCRYPTION_SIGN,
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
      if (!result.success) {
        E2EERequestManager.handleEncryptedError(
          result,
          jitContext,
          'Decryption',
          requestId
        );
      }

      const decryptedValues = E2EERequestManager.decryptBatchResponse(
        result,
        jitContext,
        (decryptedJson) => {
          const decryptData = decryptedJson.data;
          if (!decryptData) {
            throw new NodeError(
              {
                cause: new Error('Decrypted response missing data field'),
                info: {
                  operationName: 'Decryption',
                  requestId,
                },
              },
              `Decryption failed for request ${requestId}. Decrypted response missing data field`
            );
          }
          return DecryptResponseDataSchema.parse(decryptData);
        },
        {
          operationName: 'Decryption',
          requestId,
        }
      );

      // Implementation would continue with signature verification
      // Simplified for now
      return { decryptedData: 'Implementation pending' };
    },
  };
}

export function createExecuteJsAPI<T, M>(networkConfig: INetworkConfig<T, M>) {
  return {
    createRequest: async (params: ExecuteJsCreateRequestParams) => {
      _logger.info({ params }, 'executeJs:createRequest: Creating request');

      let sessionSigs: Record<string, AuthSig>;
      if ('sessionSigs' in params && params.sessionSigs) {
        sessionSigs = params.sessionSigs;
      } else {
        const pricingContext = PricingContextSchema.parse(
          params.pricingContext
        );
        sessionSigs = await issueSessionFromContext({
          pricingContext,
          authContext: params.authContext,
          delegationAuthSig: params.delegationAuthSig,
        });
      }

      const _requestId = createRequestId();
      const requests: RequestItem<z.infer<typeof EncryptedVersion1Schema>>[] =
        [];
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
          endpoint: networkConfig.endpoints.EXECUTE_JS,
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
      if (!result.success) {
        E2EERequestManager.handleEncryptedError(
          result,
          jitContext,
          'JS execution',
          requestId
        );
      }

      const decryptedResponseValues = E2EERequestManager.decryptBatchResponse(
        result,
        jitContext,
        (decryptedJson) => {
          const executeJsData = decryptedJson.data;
          if (!executeJsData) {
            throw new NodeError(
              {
                cause: new Error('Decrypted response missing data field'),
                info: {
                  operationName: 'JS execution',
                  requestId,
                },
              },
              `JS execution failed for request ${requestId}. Decrypted response missing data field`
            );
          }
          return executeJsData;
        },
        {
          operationName: 'JS execution',
          requestId,
        }
      );

      // Simplified response handling
      return {
        success: true,
        signatures: {},
        response: decryptedResponseValues[0]?.response || '',
        claims: {},
      };
    },
  };
}
