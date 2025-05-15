import { ExpirationSchema } from './lib/schemas';

import { z } from 'zod';
import { LitResourceAbilityRequestSchema } from './lib/models';
import { AuthSigSchema } from './lib/schemas';
import { LitResourceAbilityRequest } from '@lit-protocol/types';
export * from './lib/auth/auth-schemas';
export * from './lib/encryption';
export * from './lib/models';
export * from './lib/schemas';
export * from './lib/transformers';
export * from './lib/validation';

export const AuthConfigSchema = z.object({
  capabilityAuthSigs: z.array(AuthSigSchema).optional().default([]),
  expiration: ExpirationSchema.optional().default(
    new Date(Date.now() + 1000 * 60 * 15).toISOString()
  ),
  statement: z.string().optional().default(''),
  domain: z.string().optional().default(''),
  resources: z.array(LitResourceAbilityRequestSchema).optional().default([]),
  // resources: z.custom<LitResourceAbilityRequest[]>(),
});
