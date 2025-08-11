import { z } from 'zod';

import { MultipleAccessControlConditionsSchema } from '@lit-protocol/access-control-conditions-schemas';

import { PKPAuthContextSchema, EoaAuthContextSchema } from './schemas';
import { AuthSigSchema, ChainedSchema, PricedSchema } from './schemas';

export const DecryptRequestBaseSchema =
  MultipleAccessControlConditionsSchema.merge(ChainedSchema)
    .merge(PricedSchema.partial())
    .extend({
      authContext: z.union([PKPAuthContextSchema, EoaAuthContextSchema]),
      authSig: AuthSigSchema.optional(),
    });

// Metadata schema for encryption
export const EncryptionMetadataSchema = z
  .object({
    /**
     * The expected data type for decryption conversion
     * Supported types: 'uint8array', 'string', 'json', 'buffer', 'image', 'video', 'file'
     */
    dataType: z
      .enum([
        'uint8array',
        'string',
        'json',
        'buffer',
        'image',
        'video',
        'file',
      ])
      .optional(),
    /**
     * MIME type of the file (for image, video, file types)
     */
    mimeType: z.string().optional(),
    /**
     * Original filename (for image, video, file types)
     */
    filename: z.string().optional(),
    /**
     * File size in bytes
     */
    size: z.number().optional(),
    /**
     * Additional custom metadata
     */
    custom: z.record(z.any()).optional(),
  })
  .optional();

export const EncryptResponseSchema = z.object({
  /**
   * The base64-encoded ciphertext
   */
  ciphertext: z.string(),
  /**
   * The hash of the data that was encrypted
   */
  dataToEncryptHash: z.string(),
  /**
   * Optional metadata containing information about the encrypted data
   */
  metadata: EncryptionMetadataSchema,
});

export const DecryptRequestSchema = z.union([
  // Option 1: Traditional individual properties
  EncryptResponseSchema.merge(DecryptRequestBaseSchema),
  // Option 2: Encrypted data object + other required properties
  DecryptRequestBaseSchema.extend({
    /**
     * The complete encrypted response object from encryption
     */
    data: EncryptResponseSchema,
  }),
]);

export const EncryptRequestSchema = MultipleAccessControlConditionsSchema.merge(
  ChainedSchema
).extend({
  /**
   * The data to encrypt - can be string, object, or Uint8Array
   */
  dataToEncrypt: z.union([
    z.string(),
    z.record(z.any()), // for objects
    z.array(z.any()), // for arrays
    z.instanceof(Uint8Array),
  ]),
  /**
   * Optional metadata containing information about the data to encrypt
   */
  metadata: EncryptionMetadataSchema,
});
