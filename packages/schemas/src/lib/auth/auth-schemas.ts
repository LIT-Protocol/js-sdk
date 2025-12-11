import {
  AUTH_METHOD_TYPE,
  AUTH_METHOD_TYPE_VALUES,
  KEY_SET_IDENTIFIERS,
} from '@lit-protocol/constants';
import { z } from 'zod';
import {
  AuthMethodSchema,
  HexPrefixedSchema,
  NodeSetSchema,
  SessionKeyUriSchema,
} from '../schemas';
import { ScopeSchemaRaw } from './ScopeSchema';

export type CustomAuthData = z.infer<typeof CustomAuthDataSchema>;

export const CustomAuthDataSchema = z.object({
  authMethodId: HexPrefixedSchema,
  authMethodType: z.bigint(),
});

export const AuthDataSchema = z.object({
  authMethodId: HexPrefixedSchema,
  authMethodType: z.coerce.number().pipe(z.nativeEnum(AUTH_METHOD_TYPE)),
  accessToken: AuthMethodSchema.shape.accessToken,
  publicKey: HexPrefixedSchema.optional(),

  // any other auth specific data
  // eg. stytch contains user_id
  metadata: z.any().optional(),
});

export type AuthData = z.output<typeof AuthDataSchema>;
export type AuthDataInput = z.input<typeof AuthDataSchema>;

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
  keySetIdentifier: z
    .enum([KEY_SET_IDENTIFIERS.DATIL, KEY_SET_IDENTIFIERS.NAGA_KEYSET1])
    .optional(),
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
    keySetIdentifier: z
      .enum([KEY_SET_IDENTIFIERS.DATIL, KEY_SET_IDENTIFIERS.NAGA_KEYSET1])
      .optional(),

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
    authMethodType: z.coerce.number().pipe(z.nativeEnum(AUTH_METHOD_TYPE)),
    pubkey: HexPrefixedSchema.default('0x'),
    scopes: z.array(ScopeSchemaRaw).optional().default([]),
  })
  .refine(
    (data) => {
      // Validate pubkey is present for WebAuthn
      // the default has been set to 0x, so we need to check when
      // webauthn is used the pubkey should NOT be 0x
      if (data.authMethodType === AUTH_METHOD_TYPE.WebAuthn) {
        return data.pubkey && data.pubkey !== '0x';
      }
      return true;
    },
    {
      message: 'pubkey is required for WebAuthn and cannot be 0x',
      path: ['pubkey'],
    }
  );

export type MintPKPRequest = z.input<typeof MintPKPRequestSchema>;
export type MintPKPRequestTransformed = z.output<typeof MintPKPRequestSchema>;
