import { AUTH_METHOD_TYPE_VALUES } from '@lit-protocol/constants';
import { z } from 'zod';
import {
  AuthMethodSchema,
  HexPrefixedSchema,
  NodeSetSchema,
  SessionKeyUriSchema,
} from '../schemas';

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
