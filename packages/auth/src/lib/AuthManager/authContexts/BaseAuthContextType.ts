import {
  AuthSigSchema,
  DomainSchema,
  ExpirationSchema,
  HexPrefixedSchema,
  LitResourceAbilityRequestSchema,
} from '@lit-protocol/schemas';
import { z } from 'zod';

// =========== Default values ===========
export const DEFAULT_EXPIRATION = new Date(
  Date.now() + 1000 * 60 * 15 // 15 minutes
  // Date.now() + 1000 * 60 * 60 * 24 * 30 // 30 days
).toISOString();

// =========== BaseAuthContextType schemas ===========

// 👤 Who you say you are
export const BaseAuthenticationSchema = z.object({
  pkpPublicKey: HexPrefixedSchema,
  // domain: z.string().optional(),
});

/**
 * @deprecated - use the one in @lit-protocol/schemas instead
 */
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
