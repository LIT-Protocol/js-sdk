import { getChildLogger } from '@lit-protocol/logger';
import {
  PricingContextSchema,
  issueSessionFromContext,
} from '@lit-protocol/networks';
import { HexPrefixedSchema } from '@lit-protocol/schemas';
import { AuthSig, SessionKeyPair, SessionSigsMap } from '@lit-protocol/types';
import { z } from 'zod';
import type { LitClient } from '@lit-protocol/lit-client';
import type { AuthManagerParams } from '../auth-manager';
import { getPkpAuthContextAdapter } from './getPkpAuthContextAdapter';
import { getPkpAuthContextFromPreGeneratedAdapter } from './getPkpAuthContextFromPreGeneratedAdapter';

const _logger = getChildLogger({
  module: 'getPkpSessionSigsAdapter',
});

type SupportedProduct =
  | 'DECRYPTION'
  | 'SIGN'
  | 'LIT_ACTION'
  | 'SIGN_SESSION_KEY';

export type PkpSessionSigsProduct = SupportedProduct;

const BigIntLikeSchema = z
  .union([z.bigint(), z.number().finite(), z.string()])
  .transform((value) => {
    if (typeof value === 'bigint') {
      return value;
    }

    if (typeof value === 'number') {
      return BigInt(Math.trunc(value));
    }

    const normalized = value.trim();

    if (normalized.length === 0) {
      throw new Error('Cannot convert empty string to bigint');
    }

    return BigInt(normalized);
  });

const RespondingNodePricesSchema = z.array(
  z.object({
    url: z.string(),
    prices: z.array(BigIntLikeSchema).transform((prices) => {
      return prices.map((price) => {
        if (price < 0n) {
          throw new Error('Node price must be non-negative');
        }
        return price;
      });
    }),
  })
);

const HandshakeThresholdSchema = z
  .union([z.number(), z.bigint(), z.string()])
  .transform((value) => {
    if (typeof value === 'number') {
      return Math.trunc(value);
    }

    if (typeof value === 'bigint') {
      return Number(value);
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      throw new Error('Invalid threshold value provided by handshake result');
    }

    return Math.trunc(parsed);
  })
  .refine((value) => value > 0, {
    message: 'Threshold must be a positive integer',
  });

export const getPkpSessionSigsAdapter = async (
  _: AuthManagerParams,
  params: {
    pkpPublicKey: z.infer<typeof HexPrefixedSchema>;
    litClient: LitClient;
    sessionKeyPair: SessionKeyPair;
    delegationAuthSig: AuthSig;
    product?: SupportedProduct;
  }
): Promise<SessionSigsMap> => {
  const {
    pkpPublicKey,
    sessionKeyPair,
    delegationAuthSig,
    litClient,
    product = 'LIT_ACTION',
  } = params;

  _logger.info(
    {
      pkpPublicKey,
      hasSessionKeyPair: !!sessionKeyPair,
      hasDelegationAuthSig: !!delegationAuthSig,
      product,
    },
    'getPkpSessionSigsAdapter: Preparing to generate session signatures'
  );

  const litClientCtx = await litClient.getContext();

  const latestConnectionInfo = litClientCtx?.latestConnectionInfo;
  const handshakeResult = litClientCtx?.handshakeResult;

  if (!latestConnectionInfo || !handshakeResult) {
    throw new Error(
      'Missing latest connection info or handshake result from Lit client context'
    );
  }

  const nodePrices = latestConnectionInfo.priceFeedInfo?.networkPrices;

  if (!nodePrices?.length) {
    throw new Error(
      'No node pricing information available from Lit client context'
    );
  }

  const serverKeys = handshakeResult.serverKeys ?? {};
  const respondingUrlSet = new Set(Object.keys(serverKeys));

  const respondingNodePrices = nodePrices.filter((item) =>
    respondingUrlSet.has(item.url)
  );

  const threshold = HandshakeThresholdSchema.parse(handshakeResult.threshold);

  if (respondingNodePrices.length < threshold) {
    throw new Error(
      `Not enough handshake nodes to satisfy threshold. Threshold: ${threshold}, responding nodes: ${respondingNodePrices.length}`
    );
  }

  const pricingNodePrices =
    RespondingNodePricesSchema.parse(respondingNodePrices);

  const userMaxPriceValue =
    typeof litClientCtx.getUserMaxPrice === 'function'
      ? litClientCtx.getUserMaxPrice({ product })
      : undefined;

  const userMaxPrice =
    userMaxPriceValue !== undefined
      ? BigIntLikeSchema.parse(userMaxPriceValue)
      : undefined;

  const pricingContextInput: Parameters<typeof PricingContextSchema.parse>[0] =
    {
      product,
      nodePrices: pricingNodePrices,
      threshold,
      ...(userMaxPrice !== undefined ? { userMaxPrice } : {}),
    };

  const pricingContext = PricingContextSchema.parse(pricingContextInput);

  let authContext:
    | Awaited<ReturnType<typeof getPkpAuthContextAdapter>>
    | Awaited<ReturnType<typeof getPkpAuthContextFromPreGeneratedAdapter>>;

  // if (authConfig && authData) {
  //   authContext = await getPkpAuthContextAdapter(upstreamParams, {
  //     authData,
  //     pkpPublicKey,
  //     authConfig,
  //     cache,
  //     sessionKeyPair,
  //     delegationAuthSig,
  //     litClient: {
  //       getContext: async () => litClientCtx,
  //     },
  //   });
  // } else {
  if (!sessionKeyPair || !delegationAuthSig) {
    throw new Error(
      'sessionKeyPair and delegationAuthSig are required when authConfig or authData are not provided'
    );
  }

  _logger.info(
    {
      pkpPublicKey,
    },
    'getPkpSessionSigsAdapter: Falling back to pre-generated auth context helper'
  );

  authContext = await getPkpAuthContextFromPreGeneratedAdapter({
    pkpPublicKey,
    sessionKeyPair,
    delegationAuthSig,
    // ...(authData ? { authData } : {}),
  });
  // }

  const sessionSigs = await issueSessionFromContext({
    authContext,
    pricingContext,
    delegationAuthSig: delegationAuthSig,
  });

  _logger.info(
    {
      pkpPublicKey,
      product,
      respondingNodeCount: respondingNodePrices.length,
    },
    'getPkpSessionSigsAdapter: Session signatures generated successfully'
  );

  return sessionSigs;
};
