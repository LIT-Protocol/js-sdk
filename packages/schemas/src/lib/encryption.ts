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
});
