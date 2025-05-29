import {
  EncryptedPayloadV1,
  walletDecrypt,
  walletEncrypt,
} from '@lit-protocol/crypto';
import { getChildLogger } from '@lit-protocol/logger';
import { NagaJitContext } from '@lit-protocol/types';
import { bytesToHex, stringToBytes } from 'viem';
import { z } from 'zod';
import { GenericEncryptedPayloadSchema } from '../schemas';

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
): EncryptedPayloadV1 => {
  if (!jitContext.keySet[url]) {
    throw new Error(`No encryption keys found for node URL: ${url}`);
  }

  return walletEncrypt(
    jitContext.keySet[url].secretKey, // client secret key
    jitContext.keySet[url].publicKey, // node public key
    stringToBytes(JSON.stringify(requestData))
  );
};

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
  extractResponseData: (decryptedJson: any) => T
): T[] => {
  const parsedResult = GenericEncryptedPayloadSchema.parse(encryptedResult);

  if (!parsedResult.success) {
    throw new Error(`Batch decryption failed: ${JSON.stringify(parsedResult)}`);
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
      throw new Error(
        `No secret key found for verification key: ${verificationKey}`
      );
    }

    try {
      const encryptedPayload: EncryptedPayloadV1 = {
        version: encryptedResponse.version,
        payload: encryptedResponse.payload,
      };

      const decrypted = walletDecrypt(keyData.secretKey, encryptedPayload);

      // Parse the decrypted content
      const decryptedText = new TextDecoder().decode(decrypted);
      const parsedData = JSON.parse(decryptedText);

      // Extract the actual response data using the provided function
      const responseData = extractResponseData(parsedData);
      decryptedValues.push(responseData);
    } catch (decryptError) {
      const errorMessage =
        decryptError instanceof Error ? decryptError.message : 'Unknown error';
      throw new Error(
        `Failed to decrypt response ${i} with key from ${keyData.url}: ${errorMessage}`
      );
    }
  }

  if (decryptedValues.length === 0) {
    throw new Error('No responses were successfully decrypted');
  }

  return decryptedValues;
};

const handleEncryptedError = (
  errorResult: any,
  jitContext: NagaJitContext,
  operationName: string
): never => {
  if (errorResult.error && errorResult.error.payload) {
    // Try to decrypt the error payload to get the actual error message
    try {
      _logger.info(
        `${operationName}: Attempting to decrypt error payload for detailed error information...`
      );

      const errorAsEncryptedPayload = {
        success: true, // Fake success so the decryption can proceed
        values: [errorResult.error], // Wrap the error payload as if it's a successful response
      };

      const decryptedErrorValues = decryptBatchResponse(
        errorAsEncryptedPayload,
        jitContext,
        (decryptedJson) => {
          return decryptedJson.data || decryptedJson; // Return whatever we can get
        }
      );

      _logger.error(
        `${operationName}: Decrypted error details from nodes:`,
        decryptedErrorValues
      );

      // Use the actual error message from the nodes
      const firstError = decryptedErrorValues[0];
      if (firstError && firstError.error) {
        const errorMessage = firstError.error;
        const errorDetails = firstError.errorObject
          ? `. Details: ${firstError.errorObject}`
          : '';
        throw new Error(
          `${operationName} failed. ${errorMessage}${errorDetails}`
        );
      }

      // If no specific error field, show the full decrypted response
      throw new Error(
        `${operationName} failed. ${JSON.stringify(decryptedErrorValues)}`
      );
    } catch (decryptError) {
      _logger.error(
        `${operationName}: Failed to decrypt error payload:`,
        decryptError
      );

      // If the decryptError is actually our thrown error with the node's message, re-throw it
      if (
        decryptError instanceof Error &&
        decryptError.message.includes(`${operationName} failed.`)
      ) {
        throw decryptError;
      }

      throw new Error(
        `${operationName} failed. The nodes returned an encrypted error response that could not be decrypted. ` +
          `This may indicate a configuration or network connectivity issue.`
      );
    }
  } else {
    throw new Error(`${operationName} failed with no error details provided`);
  }
};

export const E2EERequestManager = {
  encryptRequestData,
  decryptBatchResponse,
  handleEncryptedError,
};
