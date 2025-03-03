import { z } from 'zod';

import { MultipleAccessControlConditionsSchema } from '@lit-protocol/access-control-conditions-schemas';

import { AuthenticationContextSchema } from './models';
import {
  AuthSigSchema,
  ChainSchema,
  ChainedSchema,
  PricedSchema,
} from './schemas';

export const DecryptRequestBaseSchema =
  MultipleAccessControlConditionsSchema.merge(ChainedSchema)
    .merge(PricedSchema.partial())
    .extend({
      authContext: AuthenticationContextSchema,
      authSig: AuthSigSchema.optional(),
    });

export const EncryptResponseSchema = z.object({
  /**
   * The base64-encoded ciphertext
   */
  ciphertext: z.string(),
  /**
   * The hash of the data that was encrypted
   */
  dataToEncryptHash: z.string(),
});

export const DecryptRequestSchema = EncryptResponseSchema.merge(
  DecryptRequestBaseSchema
);

export const EncryptRequestSchema =
  MultipleAccessControlConditionsSchema.extend({
    /**
     * The uint8array that you wish to encrypt
     */
    dataToEncrypt: z.instanceof(Uint8Array),
  });

export const EncryptStringRequestSchema =
  MultipleAccessControlConditionsSchema.extend({
    /**
     * The string that you wish to encrypt
     */
    dataToEncrypt: z.string(),
  });

export const EncryptFileRequestSchema =
  MultipleAccessControlConditionsSchema.extend({
    file: z.union([z.instanceof(File), z.instanceof(Blob)]),
  });

export const EncryptDataTypeSchema = z.enum(['string', 'file'] as const);

export const EncryptToJsonPayloadSchema = DecryptRequestBaseSchema.extend({
  ciphertext: z.string(),
  dataToEncryptHash: z.string(),
  dataType: EncryptDataTypeSchema,
});

export const EncryptToJsonPropsSchema =
  MultipleAccessControlConditionsSchema.extend({
    /**
     * The chain
     */
    chain: ChainSchema,
    /**
     * The string you wish to encrypt
     */
    string: z.string().optional(),
    /**
     * The file you wish to encrypt
     */
    file: z.union([z.instanceof(File), z.instanceof(Blob)]).optional(),
  });

export const DecryptFromJsonPropsSchema = z.object({
  parsedJsonData: EncryptToJsonPayloadSchema,
  authContext: AuthenticationContextSchema,
});
