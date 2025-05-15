import { SigningSchemeSchema } from '@lit-protocol/constants';
import { HexPrefixedSchema } from '@lit-protocol/schemas';
import { z } from 'zod';
import { AuthContextSchema, EoaAuthContextSchema } from '@lit-protocol/schemas';

export const PKPSignInputSchema = z.object({
  signingScheme: SigningSchemeSchema,
  pubKey: HexPrefixedSchema,
  toSign: z.any(),
  authContext: z.union([AuthContextSchema, EoaAuthContextSchema]),
  userMaxPrice: z.bigint().optional(),
});
