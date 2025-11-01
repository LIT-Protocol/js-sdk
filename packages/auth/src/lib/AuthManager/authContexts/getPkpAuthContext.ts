import { createPKPSiweMessage } from '@lit-protocol/auth-helpers';
import { getChildLogger } from '@lit-protocol/logger';
import {
  AuthDataSchema,
  HexPrefixedSchema,
  JsonSignSessionKeyRequestForPkpReturnSchema,
  NodeInfoSchema,
  NodeUrlsSchema,
  SessionKeyUriSchema,
  SessionKeyPairSchema,
} from '@lit-protocol/schemas';
import { AuthSig, NodeSet } from '@lit-protocol/types';
import { z } from 'zod';
import { LitAuthStorageProvider } from '../../storage';
import { LitAuthData, LitAuthDataSchema } from '../../types';
import { AuthConfig } from '../auth-manager';
import { tryGetCachedDelegationAuthSig } from '../try-getters/tryGetCachedDelegationAuthSig';
import { AuthConfigSchema } from './BaseAuthContextType';
import { validateDelegationAuthSig } from '../utils/validateDelegationAuthSig';

const _logger = getChildLogger({
  module: 'getPkpAuthContext',
});

const PkpAuthenticationSchema = z.object({
  pkpPublicKey: HexPrefixedSchema,
  authData: AuthDataSchema,
});

const ConnectionSchema = z.object({
  nodeUrls: NodeUrlsSchema,
  nonce: z.string(),
  currentEpoch: z.number(),
});

const SignSessionKeySchema = z.function().args(
  z.object({
    requestBody: JsonSignSessionKeyRequestForPkpReturnSchema,
    nodeUrls: z.array(z.string()),
  })
);

export const GetPkpAuthContextSchema = z.object({
  authentication: PkpAuthenticationSchema,
  authConfig: AuthConfigSchema,
  deps: z.object({
    connection: ConnectionSchema,
    signSessionKey: SignSessionKeySchema,
    litAuthData: LitAuthDataSchema,
    storage: z.custom<LitAuthStorageProvider>(),

    // @depreacted - to be removed. testing only.
    pkpAddress: z.string(),

    // Optional pre-generated delegation signature
    preGeneratedDelegationAuthSig: z.any().optional(),
  }),
  cache: z
    .object({
      delegationAuthSig: z.boolean().optional(),
    })
    .optional(),
  sessionKeyPair: SessionKeyPairSchema.optional(),
  delegationAuthSig: z.custom<AuthSig>().optional(),
});

interface PreparePkpAuthRequestBodyParams {
  authentication: z.infer<typeof PkpAuthenticationSchema>;
  authConfig: z.infer<typeof AuthConfigSchema>;

  // dependencies from litNodeClient(must be generated internally, not provided by the user)
  deps: {
    litAuthData: LitAuthData;
    nodeUrls: string[];
    nodeSet: NodeSet[];
    nonce: string;
    currentEpoch: number;
  };
}

/**
 * Prepare PKP Auth Request Body
 */
const preparePkpAuthRequestBody = async (
  params: PreparePkpAuthRequestBodyParams
): Promise<z.output<typeof JsonSignSessionKeyRequestForPkpReturnSchema>> => {
  const _authentication = PkpAuthenticationSchema.parse(params.authentication);
  const _authConfig = AuthConfigSchema.parse(params.authConfig);

  const _sessionKeyUri = SessionKeyUriSchema.parse(
    params.deps.litAuthData.sessionKey.keyPair.publicKey
  );

  // Auth Material (Siwe Message)
  const _siweMessage = await createPKPSiweMessage({
    pkpPublicKey: _authentication.pkpPublicKey,
    sessionKeyUri: _sessionKeyUri,
    nonce: params.deps.nonce,
    expiration: _authConfig.expiration,
    statement: _authConfig.statement,
    domain: _authConfig.domain,
    resources: _authConfig.resources,
  });

  return {
    nodeSet: params.deps.nodeSet,
    sessionKey: _sessionKeyUri,
    authData: _authentication.authData,
    pkpPublicKey: _authentication.pkpPublicKey,
    siweMessage: _siweMessage,
    curveType: 'BLS' as const,
    signingScheme: 'BLS' as const,
    epoch: params.deps.currentEpoch,
  };
};

/**
 * Get the auth context for a Lit supported native auth method (eg. WebAuthn, Discord, Google).
 * This context is needed for requesting session signatures with PKP-based authentication.
 *
 * @param {GetPkpAuthContextParams} params - Parameters for getting the native auth context.
 */
export const getPkpAuthContext = async (
  params: z.infer<typeof GetPkpAuthContextSchema>
) => {
  _logger.info(
    {
      params,
    },
    'getPkpAuthContext: params'
  );

  const _params = GetPkpAuthContextSchema.parse(params);
  const _nodeInfo = NodeInfoSchema.parse(_params.deps.connection.nodeUrls);

  const authConfig: AuthConfig = {
    capabilityAuthSigs: _params.authConfig.capabilityAuthSigs,
    expiration: _params.authConfig.expiration,
    statement: _params.authConfig.statement,
    domain: _params.authConfig.domain,
    resources: _params.authConfig.resources,
  };

  const hasProvidedSessionKeyPair = !!_params.sessionKeyPair;
  const hasProvidedDelegationAuthSig = !!_params.delegationAuthSig;

  if (hasProvidedSessionKeyPair !== hasProvidedDelegationAuthSig) {
    throw new Error(
      'Both sessionKeyPair and delegationAuthSig must be provided together, or neither should be provided'
    );
  }

  const sessionKeyPair = hasProvidedSessionKeyPair
    ? _params.sessionKeyPair!
    : _params.deps.litAuthData.sessionKey.keyPair;

  const sessionKeyUri = SessionKeyUriSchema.parse(sessionKeyPair.publicKey);

  let delegationAuthSig: AuthSig;
  let isPreGenerated = false;

  if (hasProvidedSessionKeyPair && hasProvidedDelegationAuthSig) {
    validateDelegationAuthSig({
      delegationAuthSig: _params.delegationAuthSig!,
      sessionKeyUri,
    });
    delegationAuthSig = _params.delegationAuthSig!;
    isPreGenerated = true;
  } else if (_params.deps.preGeneratedDelegationAuthSig) {
    validateDelegationAuthSig({
      delegationAuthSig: _params.deps.preGeneratedDelegationAuthSig,
      sessionKeyUri,
    });
    delegationAuthSig = _params.deps.preGeneratedDelegationAuthSig;
    isPreGenerated = true;
  } else {
    const requestBody = await preparePkpAuthRequestBody({
      authentication: _params.authentication,
      authConfig: _params.authConfig,
      deps: {
        litAuthData: _params.deps.litAuthData,
        nodeUrls: _nodeInfo.urls,
        nodeSet: _nodeInfo.nodeSet,
        nonce: _params.deps.connection.nonce,
        currentEpoch: _params.deps.connection.currentEpoch,
      },
    });

    delegationAuthSig = await tryGetCachedDelegationAuthSig({
      cache: _params.cache?.delegationAuthSig,
      storage: _params.deps.storage,
      address: _params.deps.pkpAddress,
      expiration: _params.authConfig.expiration,
      signSessionKey: () =>
        _params.deps.signSessionKey({
          requestBody,
          nodeUrls: _nodeInfo.urls,
        }),
    });
  }

  _logger.info(
    {
      delegationAuthSig,
      isPreGenerated,
      usedProvidedSessionMaterials: hasProvidedSessionKeyPair,
    },
    'getPkpAuthContext: delegationAuthSig'
  );

  return {
    chain: 'ethereum',
    pkpPublicKey: _params.authentication.pkpPublicKey,
    authData: _params.authentication.authData,

    // @deprecated - to be removed.
    authNeededCallback: async () => {
      return delegationAuthSig;
    },
    authConfig,
    sessionKeyPair,
  };
};
