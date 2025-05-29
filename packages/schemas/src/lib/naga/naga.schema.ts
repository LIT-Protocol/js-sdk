// import { EncryptedPayloadVersionedSchema } from '@lit-protocol/schema';

import { z } from 'zod';
import {
  GenericErrorResultSchemaBuilder,
  GenericResultSchemaBuilder,
} from './naga-schema-builder';

/**
 * @example
 * {
 *   verification_key: '0x1234567890abcdef',
 *   random: '0x1234567890abcdef',
 *   created_at: '2021-01-01T00:00:00.000Z',
 *   ciphertext_and_tag: '0x1234567890abcdef',
 * }
 */
export const EncryptedVersion1PayloadSchema = z.object({
  verification_key: z.string(),
  random: z.string(),
  created_at: z.string(),
  ciphertext_and_tag: z.string(),
});

/**
 * @example
 * {
 *   V1: {
 *     verification_key: '0x1234567890abcdef',
 *     random: '0x1234567890abcdef',
 *     created_at: '2021-01-01T00:00:00.000Z',
 *     ciphertext_and_tag: '0x1234567890abcdef',
 *   }
 * }
 */
export const EncryptedVersion1Schema = z
  .object({
    V1: EncryptedVersion1PayloadSchema,
  })
  .transform((data) => {
    return {
      version: '1',
      payload: data.V1,
    };
  });

/**
 * Generic encrypted payload means your schema is wrapped inside:
 *
 * @example
 * {
 *   success: boolean,
 *   error?: string,
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
export const GenericEncryptedPayloadSchema = GenericResultSchemaBuilder(
  z.object({
    version: z.string(),
    payload: EncryptedVersion1PayloadSchema,
  })
);

/**
 * Generic error schema means your schema is wrapped inside:
 *
 * @example
 * {
 *   success: boolean,
 *   error: {
 *     name: string,
 *     message: string,
 *     details: any | null,
 *   }
 * }
 */
export const GenericErrorSchema = GenericErrorResultSchemaBuilder();

/**
 * Either encrypted payload or error schema
 */
export const GenericResponseSchema =
  GenericEncryptedPayloadSchema.or(GenericErrorSchema);

export type GenericResponse = z.infer<typeof GenericResponseSchema>;
