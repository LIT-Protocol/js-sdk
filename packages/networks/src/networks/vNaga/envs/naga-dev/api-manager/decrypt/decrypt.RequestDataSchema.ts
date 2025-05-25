import { z } from 'zod';
import { MultipleAccessControlConditionsSchema } from '@lit-protocol/access-control-conditions-schemas';
import { AuthSigSchema } from '@lit-protocol/schemas';

export const DecryptRequestDataSchema = MultipleAccessControlConditionsSchema.extend({
  ciphertext: z.string(),
  dataToEncryptHash: z.string(),
  authSig: AuthSigSchema,
  chain: z.string(),
}); 