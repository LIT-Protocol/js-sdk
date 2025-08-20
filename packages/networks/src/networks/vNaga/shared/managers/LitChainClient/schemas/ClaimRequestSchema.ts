import { t } from 'elysia';
import { z } from 'zod';
import {
  toBigInt,
  toHexString,
} from '../../../../../shared/utils/z-transformers';
import { SignatureDataSchema } from './shared/SignatureDataSchema';

export const ClaimRequestSchema = z.object({
  derivedKeyId: toHexString,
  signatures: z.array(SignatureDataSchema),
  authMethodType: toBigInt,
  authMethodId: toHexString,
  authMethodPubkey: toHexString,
});

// ✨ Two types from the same schema:
// 1. User Input Type - this is the type that the user will input, eg. the API we expose for the user to call, could be a function of a request body from a POST request. (e.g., number, string, etc.)
// 2. Transformed/Validated Type - this is the type after the user input has been transformed and validated. Usually used for smart contract calls or external API calls (such as communication with nodes). (e.g., BigInt, etc.)
export type ClaimRequestRaw = z.input<typeof ClaimRequestSchema>;
export type ClaimRequestTransformed = z.infer<typeof ClaimRequestSchema>;

// ✨ Elysia Schema
export const tClaimRequestSchema = t.Object({
  derivedKeyId: t.String(),
  signatures: t.Array(
    t.Object({
      r: t.String(),
      s: t.String(),
      v: t.Number(),
    })
  ),
  authMethodType: t.Number(),
  authMethodId: t.String(),
  authMethodPubkey: t.String(),
});
