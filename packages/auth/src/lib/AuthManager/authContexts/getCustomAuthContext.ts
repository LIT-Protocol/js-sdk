import { createPKPSiweMessage } from '@lit-protocol/auth-helpers';
import { getChildLogger } from '@lit-protocol/logger';
import {
  AuthDataSchema,
  HexPrefixedSchema,
  JsonSignCustomSessionKeyRequestForPkpReturnSchema,
  JsonSignSessionKeyRequestForPkpReturnSchema,
  NodeInfoSchema,
  NodeUrlsSchema,
  SessionKeyUriSchema,
} from '@lit-protocol/schemas';
import { NodeSet } from '@lit-protocol/types';
import { z } from 'zod';
import { LitAuthStorageProvider } from '../../storage';
import { LitAuthData, LitAuthDataSchema } from '../../types';
import { AuthConfig } from '../auth-manager';
import { tryGetCachedDelegationAuthSig } from '../try-getters/tryGetCachedDelegationAuthSig';
import { AuthConfigSchema } from './BaseAuthContextType';

const _logger = getChildLogger({
  module: 'getCustomAuthContext',
});

const CustomAuthenticationSchema = z.object({
  pkpPublicKey: HexPrefixedSchema,
  // authData: z.any(),
});

const ConnectionSchema = z.object({
  nodeUrls: NodeUrlsSchema,
  nonce: z.string(),
  currentEpoch: z.number(),
});

const SignSessionKeySchema = z.function().args(
  z.object({
    requestBody: JsonSignCustomSessionKeyRequestForPkpReturnSchema,
    nodeUrls: z.array(z.string()),
  })
);

const CustomParamsSchema = z.object({
  litActionCode: z.string().optional(),
  litActionIpfsId: z.string().optional(),
  jsParams: z.record(z.any()).optional(),
});

export const GetCustomAuthContextSchema = z.object({
  authentication: CustomAuthenticationSchema,
  authConfig: AuthConfigSchema,
  customParams: CustomParamsSchema,
  deps: z.object({
    connection: ConnectionSchema,
    signCustomSessionKey: SignSessionKeySchema,
    litAuthData: LitAuthDataSchema,
    storage: z.custom<LitAuthStorageProvider>(),

    // @deprecated - to be removed. testing only.
    pkpAddress: z.string(),
  }),
});

interface PrepareCustomAuthRequestBodyParams {
  authentication: z.infer<typeof CustomAuthenticationSchema>;
  authConfig: z.infer<typeof AuthConfigSchema>;
  customParams: z.infer<typeof CustomParamsSchema>;

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
 * Prepare Custom Auth Request Body
 */
const prepareCustomAuthRequestBody = async (
  params: PrepareCustomAuthRequestBodyParams
): Promise<
  z.output<typeof JsonSignCustomSessionKeyRequestForPkpReturnSchema>
> => {
  const _authentication = CustomAuthenticationSchema.parse(
    params.authentication
  );
  const _authConfig = AuthConfigSchema.parse(params.authConfig);
  const _customParams = CustomParamsSchema.parse(params.customParams);

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

  // Base request body similar to PKP auth
  const requestBody = {
    nodeSet: params.deps.nodeSet,
    sessionKey: _sessionKeyUri,
    authData: {} as any,
    pkpPublicKey: _authentication.pkpPublicKey,
    siweMessage: _siweMessage,
    curveType: 'BLS' as const,
    signingScheme: 'BLS' as const,
    epoch: params.deps.currentEpoch,
  };

  // Add lit action parameters - ensure at least one is present
  const customRequestBody = {
    ...requestBody,
    // Add custom lit action parameters
    ...(_customParams.litActionIpfsId
      ? { litActionIpfsId: _customParams.litActionIpfsId }
      : {
          litActionCode:
            _customParams.litActionCode ||
            '(async () => { LitActions.setResponse({ response: "false", error: "No lit action provided" }); })();',
        }),
    ...(_customParams.jsParams && {
      jsParams: _customParams.jsParams,
    }),
  };

  return customRequestBody as z.output<
    typeof JsonSignCustomSessionKeyRequestForPkpReturnSchema
  >;
};

/**
 * Get the auth context for a custom authentication method with support for custom Lit Action code/IPFS ID and jsParams.
 * This context is needed for requesting session signatures with PKP-based custom authentication.
 *
 * @param {GetCustomAuthContextParams} params - Parameters for getting the custom auth context.
 */
export const getCustomAuthContext = async (
  params: z.infer<typeof GetCustomAuthContextSchema>
) => {
  _logger.info(
    {
      params,
    },
    'getCustomAuthContext: params'
  );

  // const _params = GetCustomAuthContextSchema.parse(params);
  const _params = params;
  const _nodeInfo = NodeInfoSchema.parse(params.deps.connection.nodeUrls);

  const requestBody = await prepareCustomAuthRequestBody({
    authentication: _params.authentication,
    authConfig: _params.authConfig,
    customParams: _params.customParams,
    deps: {
      litAuthData: _params.deps.litAuthData,
      nodeUrls: _nodeInfo.urls,
      nodeSet: _nodeInfo.nodeSet,
      nonce: _params.deps.connection.nonce,
      currentEpoch: _params.deps.connection.currentEpoch,
    },
  });

  const authConfig: AuthConfig = {
    capabilityAuthSigs: _params.authConfig.capabilityAuthSigs,
    expiration: _params.authConfig.expiration,
    statement: _params.authConfig.statement,
    domain: _params.authConfig.domain,
    resources: _params.authConfig.resources,
  };

  const delegationAuthSig = await tryGetCachedDelegationAuthSig({
    storage: _params.deps.storage,
    address: _params.deps.pkpAddress,
    expiration: _params.authConfig.expiration,
    signSessionKey: () =>
      _params.deps.signCustomSessionKey({
        requestBody,
        nodeUrls: _nodeInfo.urls,
      }),
  });

  _logger.info(
    {
      delegationAuthSig,
    },
    'getCustomAuthContext: delegationAuthSig'
  );

  return {
    chain: 'ethereum',
    pkpPublicKey: _params.authentication.pkpPublicKey,
    // authData: _params.authentication.authData,
    customParams: _params.customParams,

    // @deprecated - to be removed.
    authNeededCallback: async () => {
      return delegationAuthSig;
    },
    authConfig,
    sessionKeyPair: _params.deps.litAuthData.sessionKey.keyPair,
  };
};
