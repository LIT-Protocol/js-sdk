import { createPKPSiweMessage } from '@lit-protocol/auth-helpers';
import {
  AuthMethodSchema,
  HexPrefixedSchema,
  NodeInfoSchema,
  NodeSetSchema,
  NodeUrlsSchema,
  SessionKeyUriSchema,
} from '@lit-protocol/schemas';
import { NodeSet } from '@lit-protocol/types';
import { z } from 'zod';
import { generateSessionKeyPair } from '../utils/generateSessionKeyPair';
import {
  AuthConfigSchema,
  BaseAuthenticationSchema,
} from './BaseAuthContextType';

const PkpAuthenticationSchema = BaseAuthenticationSchema.extend({
  authMethods: z.array(AuthMethodSchema),
});

/**
 * Return Object Schema
 */
export const JsonSignSessionKeyRequestForPkpReturnSchema = z.object({
  nodeSet: z.array(NodeSetSchema),
  sessionKey: SessionKeyUriSchema,
  authMethods: z.array(AuthMethodSchema),
  pkpPublicKey: HexPrefixedSchema,
  siweMessage: z.string(),
  curveType: z.literal('BLS'),
  signingScheme: z.literal('BLS'),
  epoch: z.number(),
});

const ConnectionSchema = z.object({
  nodeUrls: NodeUrlsSchema,
  nonce: z.string(),
  currentEpoch: z.number(),
});

const NodeSignSessionKeySchema = z.function().args(
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
    nodeSignSessionKey: NodeSignSessionKeySchema,
  }),
});

interface PreparePkpAuthRequestBodyParams {
  authentication: z.infer<typeof PkpAuthenticationSchema>;
  authConfig: z.infer<typeof AuthConfigSchema>;

  // dependencies from litNodeClient(must be generated internally, not provided by the user)
  deps: {
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

  // -- create sessionKeyPair
  const localSessionKeyPair = generateSessionKeyPair();

  const _sessionKeyUri = SessionKeyUriSchema.parse(
    localSessionKeyPair.publicKey
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
    authMethods: _authentication.authMethods,
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
  const _params = GetPkpAuthContextSchema.parse(params);
  const _nodeInfo = NodeInfoSchema.parse(params.deps.connection.nodeUrls);

  const requestBody = await preparePkpAuthRequestBody({
    authentication: _params.authentication,
    authConfig: _params.authConfig,
    deps: {
      nodeUrls: _nodeInfo.urls,
      nodeSet: _nodeInfo.nodeSet,
      nonce: _params.deps.connection.nonce,
      currentEpoch: _params.deps.connection.currentEpoch,
    },
  });

  return {
    chain: 'ethereum',
    pkpPublicKey: _params.authentication.pkpPublicKey,
    authMethods: _params.authentication.authMethods,
    sessionKey: requestBody.sessionKey,
    resources: _params.authConfig.resources,
    capabilityAuthSigs: _params.authConfig.capabilityAuthSigs,
    expiration: _params.authConfig.expiration,
    authNeededCallback: async () => {
      const authSig = await _params.deps.nodeSignSessionKey({
        requestBody,
        nodeUrls: _nodeInfo.urls,
      });

      return authSig;
    },
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
