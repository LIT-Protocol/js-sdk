import {
  EncryptedPayloadV1,
  walletDecrypt,
  walletEncrypt,
} from '@lit-protocol/crypto';
import { NagaJitContext } from 'packages/types/src/lib/v2types';
import { bytesToHex, stringToBytes } from 'viem';
import { z } from 'zod';
import { GenericEncryptedPayloadSchema } from '../schemas';

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

export const E2EERequestManager = {
  encryptRequestData,
  decryptBatchResponse,
};
