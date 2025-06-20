import { SigningSchemeSchema } from '@lit-protocol/constants';
import { walletEncrypt } from '@lit-protocol/crypto';
import {
  AuthSigSchema,
  BytesArraySchema,
  HexPrefixedSchema,
  NodeSetsFromUrlsSchema,
  SigningChainSchema,
} from '@lit-protocol/schemas';
import { hexToBytes, stringToBytes } from 'viem';
import { z } from 'zod';
import { LitMessageSchema } from '../../../../schemas/LitMessageSchema';

// Schema for auth methods in v2 API
const AuthMethodSchema = z.object({
  authMethodType: z.number(),
  accessToken: z.string(),
});

export const PKPSignRequestDataSchema = z
  .object({
    toSign: BytesArraySchema,
    signingScheme: SigningSchemeSchema,
    // ❗️ THIS FREAKING "pubkey"! "k" is lowercase!!
    pubkey: HexPrefixedSchema,
    authSig: AuthSigSchema,
    nodeSet: NodeSetsFromUrlsSchema,
    chain: SigningChainSchema,
    bypassAutoHashing: z.boolean().optional(),

    // NEW v2 API fields
    epoch: z.number().default(0),
    authMethods: z.array(AuthMethodSchema).default([]),
  })
  .transform((item) => {
    const toSignData = item.bypassAutoHashing
      ? item.toSign
      : LitMessageSchema.parse({
          toSign: item.toSign,
          signingScheme: item.signingScheme,
          chain: item.chain,
        });

    const unencrypted = {
      toSign: toSignData,
      signingScheme: item.signingScheme,
      pubkey: item.pubkey,
      authSig: item.authSig,
      nodeSet: item.nodeSet,
      epoch: item.epoch,
      authMethods: item.authMethods,
    };

    return unencrypted;
  });
