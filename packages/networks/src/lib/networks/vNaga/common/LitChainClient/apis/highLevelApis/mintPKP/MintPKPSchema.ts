import { isHex, toBytes, toHex } from 'viem';
import { z } from 'zod';
import { AuthMethodSchema } from '../../../schemas/shared/AuthMethodSchema';
import { ScopeSchemaRaw } from '../../../schemas/shared/ScopeSchema';

export const MintPKPSchema = z
  .object({
    authMethod: AuthMethodSchema,
    scopes: z.array(ScopeSchemaRaw),
    pubkey: z.string().optional(),
    customAuthMethodId: z.string().optional(),
  })
  .transform((data) => {
    // If no customAuthMethodId provided, return data as-is
    if (!data.customAuthMethodId) {
      return data;
    }

    // Convert customAuthMethodId to hex if not already in hex format
    const hexAuthMethodId = isHex(data.customAuthMethodId)
      ? data.customAuthMethodId
      : toHex(toBytes(data.customAuthMethodId));

    // Return data with transformed customAuthMethodId
    return {
      ...data,
      customAuthMethodId: hexAuthMethodId,
    };
  });

export type MintPKPRequest = z.input<typeof MintPKPSchema>;
