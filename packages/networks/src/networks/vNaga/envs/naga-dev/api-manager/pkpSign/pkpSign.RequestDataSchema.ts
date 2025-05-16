import {
  CURVE_GROUP_BY_CURVE_TYPE,
  SigningSchemeSchema,
} from '@lit-protocol/constants';
import { hashLitMessage } from '@lit-protocol/crypto';
import {
  AuthSigSchema,
  BytesArraySchema,
  HexPrefixedSchema,
  NodeSetsFromUrlsSchema,
} from '@lit-protocol/schemas';
import { LitMessageSchema } from '@naga/schemas';
import { z } from 'zod';

export const PKPSignRequestDataSchema = z
  .object({
    toSign: BytesArraySchema,
    signingScheme: SigningSchemeSchema,
    // ❗️ THIS FREAKING "pubkey"! "k" is lowercase!!
    pubkey: HexPrefixedSchema,
    authSig: AuthSigSchema,
    nodeSet: NodeSetsFromUrlsSchema,
  })
  .transform((item) => {
    return {
      ...item,
      toSign: LitMessageSchema.parse({
        toSign: item.toSign,
        signingScheme: item.signingScheme,
      }),
    };
  });
