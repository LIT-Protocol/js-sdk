import { getAuthIdByAuthMethod } from '@lit-protocol/auth';
import { AUTH_METHOD_TYPE } from '@lit-protocol/constants';
import { HexPrefixedSchema } from '@lit-protocol/schemas';
import { Hex, isHex, toBytes, toHex } from 'viem';
import { z } from 'zod';
import { AuthMethodSchema } from '../../../schemas/shared/AuthMethodSchema';
import { ScopeSchemaRaw } from '../../../schemas/shared/ScopeSchema';

export const MintPKPSchema = z
  .object({
    authMethod: AuthMethodSchema.optional(),
    authMethodId: HexPrefixedSchema.optional(),
    authMethodType: z.number().optional(),
    scopes: z.array(ScopeSchemaRaw),
    pubkey: HexPrefixedSchema.optional(),
    customAuthMethodId: z.string().optional(),
  })
  .transform(async (data) => {
    let derivedAuthMethodId: Hex | string | undefined = data.authMethodId;
    let derivedAuthMethodType: number | undefined = data.authMethodType;
    let derivedPubkey: Hex | undefined;

    // 1. Determine authMethodType
    if (data.authMethod && typeof derivedAuthMethodType === 'undefined') {
      derivedAuthMethodType = data.authMethod.authMethodType;
    }

    // Ensure authMethodType is present
    if (typeof derivedAuthMethodType === 'undefined') {
      throw new Error(
        'authMethodType is required, either directly or via authMethod'
      );
    }

    // 2. Determine authMethodId
    if (typeof derivedAuthMethodId === 'undefined') {
      if (data.customAuthMethodId) {
        if (isHex(data.customAuthMethodId)) {
          derivedAuthMethodId = data.customAuthMethodId;
        } else {
          derivedAuthMethodId = toHex(toBytes(data.customAuthMethodId));
        }
      } else if (data.authMethod) {
        derivedAuthMethodId = await getAuthIdByAuthMethod(data.authMethod);
      }
    }

    // Ensure authMethodId is present
    if (typeof derivedAuthMethodId === 'undefined') {
      throw new Error(
        'authMethodId is required, either directly, via customAuthMethodId, or via authMethod'
      );
    }

    // 3. Determine pubkey based on the (potentially derived) authMethodType
    if (derivedAuthMethodType === AUTH_METHOD_TYPE.WebAuthn) {
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
      authMethodId: derivedAuthMethodId,
      authMethodType: derivedAuthMethodType,
      pubkey: derivedPubkey,
    };
  });

export type MintPKPRequest = z.input<typeof MintPKPSchema>;
