import { DomainSchema, ExpirationSchema } from './lib/schemas';

import { z } from 'zod';
import { LitResourceAbilityRequestSchema } from './lib/models';
import { AuthSigSchema } from './lib/schemas';
export * from './lib/auth/auth-schemas';
export * from './lib/auth/ScopeSchema';
export * from './lib/encryption';
export * from './lib/models';
export * from './lib/schemas';
export * from './lib/transformers';
export * from './lib/validation';
export * from './lib/naga/naga.schema';
export * from './lib/naga/naga-schema-builder';
export const AuthConfigSchema = z.preprocess(
  // Remove undefined values so Zod defaults can be applied properly
  (data) => {
    if (typeof data === 'object' && data !== null) {
      return Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
      );
    }
    return data;
  },
  z.object({
    capabilityAuthSigs: z.array(AuthSigSchema).optional().default([]),
    expiration: ExpirationSchema.optional().default(
      new Date(Date.now() + 1000 * 60 * 15).toISOString()
    ),
    statement: z.string().optional().default(''),
    domain: DomainSchema.optional().default('localhost'),
    resources: z.array(LitResourceAbilityRequestSchema).optional().default([]),
  })
);
