import { t } from 'elysia';
import { z } from 'zod';
import {
  toBigInt,
  toBigIntArray,
  toBigIntMatrix,
  toBoolean,
  toHexStringArray,
} from '../../../../../shared/utils/z-transformers';

export const MintRequestSchema = z.object({
  keyType: toBigInt,
  keySetId: z.literal('naga-keyset1'),
  permittedAuthMethodTypes: toBigIntArray,
  permittedAuthMethodIds: toHexStringArray,
  permittedAuthMethodPubkeys: toHexStringArray,
  permittedAuthMethodScopes: toBigIntMatrix,
  addPkpEthAddressAsPermittedAddress: toBoolean,
  sendPkpToItself: toBoolean,
});

// ✨ Two types from the same schema:
// 1. User Input Type - this is the type that the user will input, eg. the API we expose for the user to call, could be a function of a request body from a POST request. (e.g., number, string, etc.)
// 2. Transformed/Validated Type - this is the type after the user input has been transformed and validated. Usually used for smart contract calls or external API calls (such as communication with nodes). (e.g., BigInt, etc.)
export type MintRequestRaw = z.input<typeof MintRequestSchema>;
export type MintRequestTransformed = z.infer<typeof MintRequestSchema>;

// ✨ Elysia Schema
export const tMintRequestSchema = t.Object({
  keyType: t.Number(),
  permittedAuthMethodTypes: t.Array(t.Number()),
  permittedAuthMethodIds: t.Array(t.String()),
  permittedAuthMethodPubkeys: t.Array(t.String()),
  permittedAuthMethodScopes: t.Array(t.Array(t.Number())),
  addPkpEthAddressAsPermittedAddress: t.Boolean(),
  sendPkpToItself: t.Boolean(),
});
