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
  authMethodType: AuthMethodSchema.shape.authMethodType,
  accessToken: AuthMethodSchema.shape.accessToken,
  webAuthnPublicKey: HexPrefixedSchema.optional(),
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
