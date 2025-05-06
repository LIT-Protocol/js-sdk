import { z } from 'zod';
import {
  AuthMethodSchema,
  HexPrefixedSchema,
  NodeSetSchema,
  SessionKeyUriSchema,
} from '../schemas';

/**
 * Return Object Schema
 */
export const JsonSignSessionKeyRequestForPkpReturnSchema = z.object({
  nodeSet: z.array(NodeSetSchema),
  sessionKey: SessionKeyUriSchema,
  authMethods: z.array(AuthMethodSchema),
  pkpPublicKey: HexPrefixedSchema,
  siweMessage: z.string(),
  curveType: z.literal('BLS'),
  signingScheme: z.literal('BLS'),
  epoch: z.number(),
});
