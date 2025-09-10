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