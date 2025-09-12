import {
  AUTH_METHOD_TYPE,
  AUTH_METHOD_TYPE_VALUES,
} from '@lit-protocol/constants';
import { z } from 'zod';
import {
  AuthMethodSchema,
  HexPrefixedSchema,
  NodeSetSchema,
  SessionKeyUriSchema,
} from '../schemas';
import { ScopeStringSchema, SCOPE_MAPPING } from './ScopeSchema';

export const AuthDataSchema = z.object({
  authMethodId: HexPrefixedSchema,
  authMethodType: z.union([
    AuthMethodSchema.shape.authMethodType,
    z.number(),
    z.bigint(),
  ]),
  accessToken: AuthMethodSchema.shape.accessToken,
  publicKey: HexPrefixedSchema.optional(),

  // any other auth specific data
  // eg. stytch contains user_id
  metadata: z.any().optional(),
});

export type AuthData = z.infer<typeof AuthDataSchema>;

/**
 * Return Object Schema
 */
export const JsonSignSessionKeyRequestForPkpReturnSchema = z.object({
  nodeSet: z.array(NodeSetSchema),
  sessionKey: SessionKeyUriSchema,
  authData: AuthDataSchema,
  pkpPublicKey: HexPrefixedSchema,
  siweMessage: z.string(),
  curveType: z.literal('BLS'),
  signingScheme: z.literal('BLS'),
  epoch: z.number(),
});

export const JsonSignCustomSessionKeyRequestForPkpReturnSchema = z
  .object({
    nodeSet: z.array(NodeSetSchema),
    sessionKey: SessionKeyUriSchema,
    authData: AuthDataSchema,
    pkpPublicKey: HexPrefixedSchema,
    siweMessage: z.string(),
    curveType: z.literal('BLS'),
    signingScheme: z.literal('BLS'),
    epoch: z.number(),

    // custom auth params
    jsParams: z.record(z.any()).optional(),
  })
  .and(
    z.union([
      z.object({
        litActionCode: z.string(),
        litActionIpfsId: z.never().optional(),
      }),
      z.object({
        litActionCode: z.never().optional(),
        litActionIpfsId: z.string(),
      }),
    ])
  );

/**
 * Consolidated schema for PKP mint requests.
 * This replaces the duplicated schemas across the codebase.
 * Handles both string and number authMethodType inputs.
 */
export const MintPKPRequestSchema = z
  .object({
    authMethodId: HexPrefixedSchema,
    // Accept string, number, or enum for backwards compatibility
    authMethodType: z
      .union([
        AuthMethodSchema.shape.authMethodType, // z.nativeEnum(AUTH_METHOD_TYPE)
        z.string().transform((val) => parseInt(val, 10)),
        z.number(),
      ])
      .transform((val) => {
        // Ensure it's a valid AUTH_METHOD_TYPE enum value
        const numVal = typeof val === 'string' ? parseInt(val, 10) : val;
        if (!Object.values(AUTH_METHOD_TYPE).includes(numVal as any)) {
          throw new Error(`Invalid authMethodType: ${val}`);
        }
        return numVal as AUTH_METHOD_TYPE_VALUES;
      }),
    pubkey: HexPrefixedSchema.optional(),
    scopes: z.array(ScopeStringSchema).optional().default([]),
  })
  .transform(async (data) => {
    let derivedPubkey: z.infer<typeof HexPrefixedSchema>;

    // Validate pubkey for WebAuthn
    if (data.authMethodType === AUTH_METHOD_TYPE.WebAuthn) {
      if (!data.pubkey || data.pubkey === '0x') {
        throw new Error(
          `pubkey is required for WebAuthn and cannot be 0x. Received pubkey: "${data.pubkey}" and authMethodType: ${data.authMethodType}`
        );
      }
      derivedPubkey = data.pubkey;
    } else {
      derivedPubkey = '0x' as z.infer<typeof HexPrefixedSchema>;
    }

    // Transform scope strings to bigints for contract calls
    const scopeBigInts = data.scopes.map(scope => SCOPE_MAPPING[scope]);

    return {
      ...data,
      pubkey: derivedPubkey,
      scopes: scopeBigInts,
    };
  });

export type MintPKPRequest = z.input<typeof MintPKPRequestSchema>;
export type MintPKPRequestTransformed = z.output<typeof MintPKPRequestSchema>;
