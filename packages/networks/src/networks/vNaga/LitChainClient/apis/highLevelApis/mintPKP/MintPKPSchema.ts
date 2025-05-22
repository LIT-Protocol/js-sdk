import { getAuthIdByAuthMethod } from '@lit-protocol/auth';
import { AUTH_METHOD_TYPE } from '@lit-protocol/constants';
import { HexPrefixedSchema } from '@lit-protocol/schemas';
import { Hex, isHex, toBytes, toHex } from 'viem';
import { z } from 'zod';
import { AuthMethodSchema } from '../../../schemas/shared/AuthMethodSchema';
import { ScopeSchemaRaw } from '../../../schemas/shared/ScopeSchema';

export const MintPKPSchema = z
  .object({
    // authMethod: AuthMethodSchema,
    authMethodId: HexPrefixedSchema,
    authMethodType: z.number(),
    scopes: z.array(ScopeSchemaRaw),
    pubkey: HexPrefixedSchema.optional(),
  })
  .transform(async (data) => {
    let derivedPubkey: Hex | undefined;

    // Determine pubkey based on the (potentially derived) authMethodType
    if (data.authMethodType === AUTH_METHOD_TYPE.WebAuthn) {
      if (!data.pubkey) {
        throw new Error('pubkey is required for WebAuthn');
      }
      derivedPubkey = data.pubkey as Hex;
    } else {
      derivedPubkey = '0x' as Hex;
    }

    // Ensure pubkey is present (it should always be by this point)
    if (typeof derivedPubkey === 'undefined') {
      // This case should ideally not be reached if logic above is correct
      throw new Error('pubkey could not be determined');
    }

    // Return data with resolved/derived values
    return {
      ...data,
      authMethodId: data.authMethodId,
      authMethodType: data.authMethodType,
      pubkey: derivedPubkey,
    };
  });

export type MintPKPRequest = z.input<typeof MintPKPSchema>;
