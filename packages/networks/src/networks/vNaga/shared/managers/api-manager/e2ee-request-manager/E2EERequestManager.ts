import { walletDecrypt, walletEncrypt } from '@lit-protocol/crypto';
import {
  LitNodeClientBadConfigError,
  NodeError,
} from '@lit-protocol/constants';
import { getChildLogger } from '@lit-protocol/logger';
import { NagaJitContext } from '@lit-protocol/types';
import { bytesToHex, stringToBytes } from 'viem';
import { z } from 'zod';
import {
  EncryptedVersion1Schema,
  GenericEncryptedPayloadSchema,
} from '@lit-protocol/schemas';

const _logger = getChildLogger({
  module: 'E2EERequestManager',
});

/**
 * Generic function to encrypt request data using JIT context
 * @param requestData The request data to encrypt
 * @param url The node URL to encrypt for
 * @param jitContext The JIT context containing key mappings
 * @returns Encrypted payload ready to send to the node
 */
const encryptRequestData = (
  requestData: any,
  url: string,
  jitContext: NagaJitContext
): z.infer<typeof EncryptedVersion1Schema> => {
  if (!jitContext.keySet[url]) {
    throw new LitNodeClientBadConfigError(
      {
        cause: new Error(`Missing encryption keys for node URL: ${url}`),
        info: {
          url,
        },
      },
      `No encryption keys found for node URL: ${url}`
    );
  }

  return walletEncrypt(
    jitContext.keySet[url].secretKey, // client secret key
    jitContext.keySet[url].publicKey, // node public key
    stringToBytes(JSON.stringify(requestData))
  );
};

interface DecryptBatchResponseOptions {
  requestId?: string;
  operationName?: string;
}

/**
 * Generic function to decrypt batch responses using JIT context
 * @param encryptedResult The encrypted batch result from nodes
 * @param jitContext The JIT context containing key mappings
 * @param extractResponseData Function to extract actual response data from decrypted content
 * @returns Array of decrypted response values
 */
const decryptBatchResponse = <T>(
  encryptedResult: z.infer<typeof GenericEncryptedPayloadSchema>,
  jitContext: NagaJitContext,
  extractResponseData: (decryptedJson: any, nodeUrl: string) => T,
  options: DecryptBatchResponseOptions = {}
): T[] => {
  const operationName = options.operationName ?? 'Lit network operation';
  const requestId = options.requestId;
  const parsedResult = GenericEncryptedPayloadSchema.parse(encryptedResult);
  const baseMessage = requestId
    ? `"${operationName}" failed for request ${requestId}`
    : `"${operationName}" failed`;

  if (!parsedResult.success) {
    throw new NodeError(
      {
        cause: new Error('Batch decryption failed'),
        info: {
          operationName,
          requestId,
          parsedResult,
        },
      },
      '%s',
      `${baseMessage}. Batch decryption failed: ${JSON.stringify(parsedResult)}`
    );
  }

  const decryptedValues: T[] = [];

  // Create a reverse mapping: nodePublicKey -> client secret key
  const verificationKeyToSecretKey: Record<
    string,
    { url: string; secretKey: Uint8Array }
  > = {};

  for (const url of Object.keys(jitContext.keySet)) {
    // Convert the stored node public key (Uint8Array) to hex string without 0x prefix
    const nodePublicKeyHex = bytesToHex(
      jitContext.keySet[url].publicKey
    ).replace('0x', '');
    verificationKeyToSecretKey[nodePublicKeyHex] = {
      url,
      secretKey: jitContext.keySet[url].secretKey,
    };
  }

  // Decrypt each encrypted payload
  for (let i = 0; i < parsedResult.values.length; i++) {
    const encryptedResponse = parsedResult.values[i];
    const verificationKey = encryptedResponse.payload.verification_key;

    // Find the correct secret key for this response based on verification key
    const keyData = verificationKeyToSecretKey[verificationKey];

    if (!keyData) {
      throw new NodeError(
        {
          cause: new Error(
            `No secret key found for verification key: ${verificationKey}`
          ),
          info: {
            operationName,
            requestId,
            verificationKey,
          },
        },
        '%s',
        `${baseMessage}. No secret key found for verification key: ${verificationKey}`
      );
    }

    try {
      const encryptedPayload: z.infer<typeof EncryptedVersion1Schema> = {
        version: encryptedResponse.version,
        payload: encryptedResponse.payload,
      };

      const decrypted = walletDecrypt(keyData.secretKey, encryptedPayload);

      // Parse the decrypted content
      const decryptedText = new TextDecoder().decode(decrypted);
      const parsedData = JSON.parse(decryptedText);

      // Extract the actual response data using the provided function
      const responseData = extractResponseData(parsedData, keyData.url);
      decryptedValues.push(responseData);
    } catch (decryptError) {
      const convertedError =
        decryptError instanceof Error
          ? decryptError
          : new Error(String(decryptError));
      throw new NodeError(
        {
          cause: convertedError,
          info: {
            operationName,
            requestId,
            responseIndex: i,
            nodeUrl: keyData.url,
          },
        },
        '%s',
        `${baseMessage}. Failed to decrypt response ${i} with key from ${keyData.url}: ${convertedError.message}`
      );
    }
  }

  if (decryptedValues.length === 0) {
    throw new NodeError(
      {
        cause: new Error('No responses were successfully decrypted'),
        info: {
          operationName,
          requestId,
        },
      },
      '%s',
      `${baseMessage}. No responses were successfully decrypted`
    );
  }

  return decryptedValues;
};

const handleEncryptedError = (
  errorResult: any,
  jitContext: NagaJitContext,
  operationName: string,
  requestId: string
): never => {
  const baseMessage = requestId
    ? `"${operationName}" failed for request ${requestId}`
    : `"${operationName}" failed`;

  const nodeErrors =
    errorResult?.error && typeof errorResult.error === 'object'
      ? (errorResult.error as { __nodeErrors?: unknown }).__nodeErrors
      : undefined;

  if (errorResult.error && errorResult.error.payload) {
    // Try to decrypt the error payload to get the actual error message
    try {
      _logger.info(
        { requestId },
        `"${operationName}": Attempting to decrypt error payload for detailed error information...`
      );

      const errorAsEncryptedPayload = {
        success: true, // Fake success so the decryption can proceed
        values: [errorResult.error], // Wrap the error payload as if it's a successful response
      };

      const decryptedErrorValues = decryptBatchResponse(
        errorAsEncryptedPayload as z.infer<
          typeof GenericEncryptedPayloadSchema
        >,
        jitContext,
        (decryptedJson, nodeUrl) => {
          const payload = decryptedJson.data || decryptedJson;
          if (payload && typeof payload === 'object') {
            return {
              ...(payload as Record<string, unknown>),
              __nodeUrl: nodeUrl,
            };
          }
          return { value: payload, __nodeUrl: nodeUrl };
        },
        {
          operationName: `${operationName} error payload`,
          requestId,
        }
      );

      _logger.error(
        { requestId, decryptedErrorValues },
        `"${operationName}": Decrypted error details from nodes:`
      );

      // Use the actual error message from the nodes
      const firstError = decryptedErrorValues[0];
      if (firstError && firstError.error) {
        const convertedError =
          firstError.error instanceof Error
            ? firstError.error
            : new Error(String(firstError.error));
        const errorDetails = firstError.errorObject
          ? `. Details: ${firstError.errorObject}`
          : '';
        throw new NodeError(
          {
            cause: convertedError,
            info: {
              operationName,
              requestId,
              rawNodeError: firstError,
              nodeErrors,
            },
          },
          '%s',
          `${baseMessage}. ${convertedError.message}${errorDetails}`
        );
      }

      // If no specific error field, show the full decrypted response
      throw new NodeError(
        {
          cause: new Error('Node error payload missing expected structure'),
          info: {
            operationName,
            requestId,
            decryptedErrorValues,
            nodeErrors,
          },
        },
        '%s',
        `${baseMessage}. ${JSON.stringify(decryptedErrorValues)}`
      );
    } catch (decryptError) {
      _logger.error(
        { requestId, decryptError },
        `"${operationName}": Failed to decrypt error payload:`
      );

      if (decryptError instanceof NodeError) {
        throw decryptError;
      }

      const convertedError =
        decryptError instanceof Error
          ? decryptError
          : new Error(String(decryptError));

      // If the decryptError is actually our thrown error with the node's message, re-throw it
      throw new NodeError(
        {
          cause: convertedError,
          info: {
            operationName,
            requestId,
            rawError: errorResult,
            nodeErrors,
          },
        },
        '%s',
        `${baseMessage}. The nodes returned an encrypted error response that could not be decrypted. ${JSON.stringify(
          errorResult
        )}. If you are running custom session sigs, it might mean the validation has failed. We will continue to improve this error message to provide more information.`
      );
    }
  } else {
    const rawError = errorResult?.error ?? errorResult;
    const normalizedCause =
      rawError instanceof Error ? rawError : new Error(String(rawError));
    throw new NodeError(
      {
        cause: normalizedCause,
        info: {
          operationName,
          requestId,
          rawError: errorResult,
          nodeErrors,
        },
      },
      '%s',
      `${baseMessage}. ${JSON.stringify(errorResult)}`
    );
  }
};

export const E2EERequestManager = {
  encryptRequestData,
  decryptBatchResponse,
  handleEncryptedError,
};
