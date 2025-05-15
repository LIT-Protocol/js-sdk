import { SigningSchemeSchema } from '@lit-protocol/constants';
import {
  AuthSigSchema,
  Bytes32Schema,
  HexPrefixedSchema,
  NodeSetsFromUrlsSchema,
} from '@lit-protocol/schemas';
import { z } from 'zod';

export const PKPSignRequestDataSchema = z.object({
  toSign: Bytes32Schema,
  signingScheme: SigningSchemeSchema,
  // ❗️ THIS FREAKING "pubkey"! "k" is lowercase!!
  pubkey: HexPrefixedSchema,
  authSig: AuthSigSchema,
  nodeSet: NodeSetsFromUrlsSchema,
});
