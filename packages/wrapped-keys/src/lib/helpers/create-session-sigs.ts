import type { createAuthManager } from '@lit-protocol/auth';
import { generateSessionKeyPair } from '@lit-protocol/auth';
import { LIT_ABILITY } from '@lit-protocol/constants';
import type { LitClient } from '@lit-protocol/lit-client';
import {
  issueSessionFromContext,
  PricingContextSchema,
} from '@lit-protocol/networks';
import type { AuthData } from '@lit-protocol/schemas';
import type { SessionKeyPair, SessionSigsMap } from '@lit-protocol/types';

const DEFAULT_RESOURCES: [
  (typeof LIT_ABILITY)[keyof typeof LIT_ABILITY],
  string
][] = [
  [LIT_ABILITY.PKPSigning, '*'],
  [LIT_ABILITY.LitActionExecution, '*'],
  [LIT_ABILITY.AccessControlConditionDecryption, '*'],
];

const UNSIGNED_128_MAX = 340_282_366_920_938_463_463_374_607_431_768_211_455n;

type AuthManagerInstance = ReturnType<typeof createAuthManager>;
type LitClientInstance = LitClient;

/**
 * Creates a PKP auth context using the new delegation helpers so that it can be
 * reused with the existing wrapped-keys APIs.
 */
type WrappedKeysAuthContext = Awaited<
  ReturnType<AuthManagerInstance['createPkpAuthContextFromPreGenerated']>
>;

export async function createWrappedKeysAuthContext(params: {
  authManager: AuthManagerInstance;
  pkpPublicKey: string;
  authData: AuthData;
  litClient: LitClientInstance;
  resources?: Array<[(typeof LIT_ABILITY)[keyof typeof LIT_ABILITY], string]>;
  expiration?: string;
  sessionKeyPair?: SessionKeyPair;
}): Promise<WrappedKeysAuthContext> {
  const resources = params.resources ?? DEFAULT_RESOURCES;
  const expiration =
    params.expiration ?? new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const sessionKeyPair = params.sessionKeyPair ?? generateSessionKeyPair();

  const delegationAuthSig =
    await params.authManager.generatePkpDelegationAuthSig({
      pkpPublicKey: params.pkpPublicKey,
      authData: params.authData,
      sessionKeyPair,
      authConfig: {
        resources,
        expiration,
      },
      litClient: params.litClient,
    });

  const authContext =
    await params.authManager.createPkpAuthContextFromPreGenerated({
      pkpPublicKey: params.pkpPublicKey,
      sessionKeyPair,
      delegationAuthSig,
      authData: params.authData,
    });

  return {
    ...authContext,
    // Older auth context implementations may not hydrate this helper.
    authNeededCallback:
      authContext.authNeededCallback ?? (async () => delegationAuthSig),
  };
}

type SupportedProduct =
  | 'DECRYPTION'
  | 'SIGN'
  | 'LIT_ACTION'
  | 'SIGN_SESSION_KEY';

type LitClientContextSnapshot = Awaited<
  ReturnType<LitClientInstance['getContext']>
>;

/**
 * Derives the SessionSigsMap expected by the wrapped-keys SDK from an
 * AuthenticationContext produced by {@link createWrappedKeysAuthContext}.
 *
 * This avoids any changes to the wrapped-keys HTTP layer while still letting
 * consumers rely on the new delegation helpers.
 */
export async function createSessionSigsForWrappedKeys(params: {
  litClient: LitClientInstance;
  authContext: WrappedKeysAuthContext;
  product?: SupportedProduct;
}): Promise<SessionSigsMap> {
  const product = params.product ?? 'LIT_ACTION';
  const context =
    (await params.litClient.getContext()) as LitClientContextSnapshot;

  const handshakeResult = context?.handshakeResult;

  if (!handshakeResult) {
    throw new Error(
      'Unable to resolve handshake result from Lit client context. Ensure the client has completed an initial handshake.'
    );
  }

  const serverKeys = handshakeResult.serverKeys ?? {};
  const nodeUrls = Object.keys(serverKeys);

  if (nodeUrls.length === 0) {
    throw new Error(
      'No responding nodes found in handshake result; cannot generate session signatures.'
    );
  }

  const nodePrices = nodeUrls.map((url) => ({
    url,
    prices: [1n, 1n, 1n, 1n],
  }));

  const threshold =
    typeof handshakeResult.threshold === 'number'
      ? handshakeResult.threshold
      : nodeUrls.length;

  const userMaxPrice =
    context?.getUserMaxPrice?.({ product }) ?? UNSIGNED_128_MAX;

  const pricingContext = PricingContextSchema.parse({
    product,
    nodePrices,
    threshold,
    userMaxPrice,
  });

  return issueSessionFromContext({
    authContext: params.authContext as Parameters<
      typeof issueSessionFromContext
    >[0]['authContext'],
    pricingContext,
  });
}

export { DEFAULT_RESOURCES };
