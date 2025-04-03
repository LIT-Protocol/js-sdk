import { z } from 'zod';

import { MultipleAccessControlConditionsSchema } from '@lit-protocol/access-control-conditions-schemas';

import { AuthenticationContextSchema } from './models';
import { AuthSigSchema, ChainedSchema, PricedSchema } from './schemas';

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
