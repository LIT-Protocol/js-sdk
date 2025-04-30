import {
  AuthSigSchema,
  HexPrefixedSchema,
  LitResourceAbilityRequestSchema,
} from '@lit-protocol/schemas';
import { z, ZodTypeAny } from 'zod';

// =========== Default values ===========
export const DEFAULT_EXPIRATION = new Date(
  Date.now() + 1000 * 60 * 15 // 15 minutes
  // Date.now() + 1000 * 60 * 60 * 24 * 30 // 30 days
).toISOString();

// =========== BaseAuthContextType schemas ===========

// 👤 Who you say you are
export const BaseAuthenticationSchema = z.object({
  pkpPublicKey: HexPrefixedSchema,
  domain: z.string().optional(),
});

// 🔑 What you say you can do
export const BaseAuthorisationSchema = z.object({
  resources: z.array(LitResourceAbilityRequestSchema),
  capabilityAuthSigs: z.array(AuthSigSchema).optional(),
});

// ⏳ When you say you can do it
export const BaseSessionControlSchema = z
  .object({
    expiration: z.string().default(DEFAULT_EXPIRATION),
  })
  .default({})
  .or(z.undefined());

// 📝 What you say about yourself
export const BaseMetadataSchema = z
  .object({
    statement: z.string().default(''),
  })
  .default({})
  .or(z.undefined());

// =========== BaseAuthContextType schemas ===========

/**
 * Any auth context type must implement this interface.
 */
export interface BaseAuthContextType<
  T extends z.infer<typeof BaseAuthenticationSchema>,
  M extends z.infer<typeof BaseAuthorisationSchema>,
  S extends z.infer<typeof BaseSessionControlSchema>,
  D extends z.infer<typeof BaseMetadataSchema>
> {
  authentication: T;
  authorisation: M;
  sessionControl: S;
  metadata: D;
}

/**
 * Creates a Zod schema for the BaseAuthContextType structure.
 */
export const createBaseAuthContextTypeSchema = <
  T_Schema extends ZodTypeAny,
  M_Schema extends ZodTypeAny,
  S_Schema extends ZodTypeAny,
  D_Schema extends ZodTypeAny
>(
  authenticationSchema: T_Schema,
  authorisationSchema: M_Schema,
  sessionControlSchema: S_Schema,
  metadataSchema: D_Schema
) => {
  return z.object({
    authentication: authenticationSchema,
    authorisation: authorisationSchema,
    sessionControl: sessionControlSchema,
    metadata: metadataSchema,
  });
};
