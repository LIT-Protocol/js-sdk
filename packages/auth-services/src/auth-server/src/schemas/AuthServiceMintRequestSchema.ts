import { t } from 'elysia';
import { z } from 'zod';

/**
 * Schema for auth service PKP mint request
 * This is a simplified version for minting with a single auth method
 */
export const AuthServiceMintRequestSchema = z.object({
  authMethodType: z.string(),
  authMethodId: z.string(),
  pubkey: z.string().optional().default('0x'),
  scopes: z
    .array(z.enum(['sign-anything', 'personal-sign', 'no-permissions']))
    .optional(),
});

// User Input Type - what the API accepts
export type AuthServiceMintRequestRaw = z.input<
  typeof AuthServiceMintRequestSchema
>;

// Transformed/Validated Type - after validation
export type AuthServiceMintRequestTransformed = z.infer<
  typeof AuthServiceMintRequestSchema
>;

// Elysia Schema for runtime validation
export const tAuthServiceMintRequestSchema = t.Object({
  authMethodType: t.String(),
  authMethodId: t.String(),
  pubkey: t.Optional(t.String()),
  scopes: t.Optional(
    t.Array(
      t.Union([
        t.Literal('sign-anything'),
        t.Literal('personal-sign'),
        t.Literal('no-permissions'),
      ])
    )
  ),
});
