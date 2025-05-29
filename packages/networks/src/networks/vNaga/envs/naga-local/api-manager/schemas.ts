import { EncryptedPayloadV1Schema } from '@lit-protocol/crypto';
import { z } from 'zod';

/**
 * Generic response means your schema is wrapped inside:
 *
 * @example
 * {
 *   ok: boolean,
 *   error: string | null,
 *   errorObject: any | null,
 *   data: <YOUR_SCHEMA>
 * }
 */
export const GenericResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
) => {
  const baseSchema = z.object({
    ok: z.boolean(),
    error: z.string().nullable(),
    errorObject: z.any().nullable(),
    data: dataSchema,
  });

  return baseSchema.extend({}).transform((parsed) => ({
    ...parsed,
    parseData: () => {
      // Check if the response is successful
      if (!parsed.ok) {
        // If there's an error object, throw that; otherwise throw the error message
        if (parsed.errorObject) {
          throw parsed.errorObject;
        } else if (parsed.error) {
          throw new Error(parsed.error);
        } else {
          throw new Error('Request failed but no error information provided');
        }
      }

      // Return only the data portion
      return parsed.data;
    },
  }));
};

/**
 * Generic result means your schema is wrapped inside:
 *
 * @example
 * {
 *   success: boolean,
 *   values: Array<YOUR_SCHEMA>
 */
export const GenericResultSchema = <T extends z.ZodTypeAny>(dataSchema: T) => {
  return z.object({
    success: z.boolean(),
    values: z.array(dataSchema),
  });
};

/**
 * Generic encrypted payload means your schema is wrapped inside:
 *
 * @example
 * {
 *   success: boolean,
 *   values: Array<{
 *     version: "1",
 *     payload: {
 *       verification_key: string,
 *       random: string,
 *       created_at: string,
 *       ciphertext_and_tag: string
 *     }
 *   }>
 * }
 */
export const GenericEncryptedPayloadSchema = GenericResultSchema(
  z.object({
    version: z.string(),
    payload: EncryptedPayloadV1Schema._def.schema.shape.V1,
  })
);
