import { z } from 'zod';

/**
 * Schema for Lit Action signed data
 * This is completely flexible to handle any signature structure that can be returned
 * since the structure depends entirely on what the Lit Action code does and what
 * sigName(s) are used in the signing operations
 */
const LitActionSignedDataSchema = z.any();

/**
 * Schema for Lit Action claim data
 */
const LitActionClaimDataSchema = z.object({
  signatures: z.array(z.any()),
  derivedKeyId: z.string(),
});

/**
 * ExecuteJs Response Data Schema
 * This defines the structure of responses from nodes for executeJs requests
 * Based on ExecuteJsValueResponse interface
 */
export const ExecuteJsResponseDataSchema = z.object({
  success: z.boolean(),
  values: z.array(
    z.object({
      /**
       * Success status of the execution
       */
      success: z.boolean(),

      /**
       * Claim data from the Lit Action execution
       */
      claimData: z.record(z.string(), LitActionClaimDataSchema),

      /**
       * Any decrypted data from the execution
       */
      decryptedData: z.any(),

      /**
       * Console logs from the Lit Action execution
       */
      logs: z.string(),

      /**
       * Response data from the Lit Action (usually JSON string)
       */
      response: z.string(),

      /**
       * Signed data from the Lit Action execution
       */
      signedData: z.record(z.string(), LitActionSignedDataSchema),
    })
  ),
});
