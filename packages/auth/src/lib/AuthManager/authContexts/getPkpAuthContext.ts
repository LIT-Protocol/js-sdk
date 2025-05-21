import { createPKPSiweMessage } from '@lit-protocol/auth-helpers';
import {
  AuthDataSchema,
  HexPrefixedSchema,
  JsonSignSessionKeyRequestForPkpReturnSchema,
  NodeInfoSchema,
  NodeUrlsSchema,
  SessionKeyUriSchema,
} from '@lit-protocol/schemas';
import { NodeSet } from '@lit-protocol/types';
import { z } from 'zod';
import { LitAuthData, LitAuthDataSchema } from '../../types';
import { AuthConfig } from '../auth-manager';
import { AuthConfigSchema } from './BaseAuthContextType';

// const PkpAuthenticationSchema = BaseAuthenticationSchema.extend({
//   authMethods: z.array(AuthMethodSchema),
// });

const PkpAuthenticationSchema = z.object({
  pkpPublicKey: HexPrefixedSchema,
  authData: AuthDataSchema,
});

const ConnectionSchema = z.object({
  nodeUrls: NodeUrlsSchema,
  nonce: z.string(),
  currentEpoch: z.number(),
});

const NodeSignSessionKeySchema = z.function().args(
  z.object({
    requestBody: JsonSignSessionKeyRequestForPkpReturnSchema,

    // @deprecated - we only need requestBody because nodeUrls is already provided in it
    nodeUrls: z.array(z.string()),
  })
);

export const GetPkpAuthContextSchema = z.object({
  authentication: PkpAuthenticationSchema,
  authConfig: AuthConfigSchema,
  deps: z.object({
    connection: ConnectionSchema,
    nodeSignSessionKey: NodeSignSessionKeySchema,
    litAuthData: LitAuthDataSchema,
  }),
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
  console.log('[getPkpAuthContext] params:', params);

  const _params = GetPkpAuthContextSchema.parse(params);
  const _nodeInfo = NodeInfoSchema.parse(params.deps.connection.nodeUrls);

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

  const authConfig: AuthConfig = {
    capabilityAuthSigs: _params.authConfig.capabilityAuthSigs,
    expiration: _params.authConfig.expiration,
    statement: _params.authConfig.statement,
    domain: _params.authConfig.domain,
    resources: _params.authConfig.resources,
  };

  return {
    chain: 'ethereum',
    pkpPublicKey: _params.authentication.pkpPublicKey,
    authData: _params.authentication.authData,
    // sessionKey: requestBody.sessionKey,
    // resources: _params.authConfig.resources,
    // capabilityAuthSigs: _params.authConfig.capabilityAuthSigs,
    // expiration: _params.authConfig.expiration,
    authNeededCallback: async () => {
      const authSig = await _params.deps.nodeSignSessionKey({
        requestBody,
        nodeUrls: _nodeInfo.urls,
      });

      return authSig;
    },
    authConfig,
    sessionKeyPair: _params.deps.litAuthData.sessionKey.keyPair,
  };
};

// const authContext = await LitAuth.getPkpAuthContext({
//   authentication: {
//     pkpPublicKey:
//       '0x04e5603fe1cc5ce207c12950939738583b599f22a152c3672a4c0eee887d75dd405246ac3ed2430283935a99733eac9520581af9923c0fc04fad1d67d60908ce18',

//     // an authenticator outside of this should handle the authMethods
//     authMethods: [
//       {
//         authMethodType: 1,
//         accessToken: '123',
//       },
//     ],
//   },
//   authorisation: {
//     resources: createResourceBuilder().addPKPSigningRequest('*').requests,
//     // -- (optional) default is null
//     // capabilityAuthSigs: [],
//   },
//   // -- (optional) default is 15 minutes
//   // sessionControl: {
//   //   expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
//   // },

//   // -- (optional) default is empty string
//   // metadata: {
//   //   statement: 'test',
//   // },
//   connection: {
//     nodeUrls: _nodeUrls,
//     nonce: _nonce,
//     currentEpoch: _currentEpoch,
//   },
//   nodeSignSessionKey: _signSessionKey,
// });

// console.log('authContext:', JSON.stringify(authContext, null, 2));
