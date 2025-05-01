import { createPKPSiweMessage } from '@lit-protocol/auth-helpers';
import {
  AuthMethodSchema,
  HexPrefixedSchema,
  NodeInfoSchema,
  NodeSetSchema,
} from '@lit-protocol/schemas';
import { NodeSet } from '@lit-protocol/types';
import { z } from 'zod';
import { generateSessionKeyPair } from '../utils/generateSessionKeyPair';
import {
  BaseAuthenticationSchema,
  BaseAuthorisationSchema,
  BaseMetadataSchema,
  BaseSessionControlSchema,
  createBaseAuthContextTypeSchema,
} from './BaseAuthContextType';

const PkpAuthenticationSchema = BaseAuthenticationSchema.extend({
  authMethods: z.array(AuthMethodSchema),
});

const PkpAuthorisationSchema = BaseAuthorisationSchema;
const PkpSessionControlSchema = BaseSessionControlSchema;
const PkpMetadataSchema = BaseMetadataSchema;

/**
 * Return Object Schema
 */
export const JsonSignSessionKeyRequestForPkpReturnSchema = z.object({
  nodeSet: z.array(NodeSetSchema),
  sessionKey: z.string(),
  authMethods: z.array(AuthMethodSchema),
  pkpPublicKey: HexPrefixedSchema,
  siweMessage: z.string(),
  curveType: z.literal('BLS'),
  signingScheme: z.literal('BLS'),
  epoch: z.number(),
});

// /**
//  * Request Object Schema
//  */
// export const JsonSignSessionKeyRequestForPkpSchema = z
//   .object({
//     authentication: PkpAuthenticationSchema,
//     authorisation: PkpAuthorisationSchema,
//     sessionControl: PkpSessionControlSchema,
//     metadata: PkpMetadataSchema,
//     nodeSet: z.array(NodeSetSchema),
//     siweMessage: z.string(),
//     epoch: z.number(),
//   })
//   .transform((item) =>
//     JsonSignSessionKeyRequestForPkpReturnSchema.parse({
//       authMethods: item.authentication.authMethods,
//       pkpPublicKey: item.authentication.pkpPublicKey,
//       nodeSet: item.nodeSet,
//       siweMessage: item.siweMessage,
//       curveType: 'BLS' as const,
//       signingScheme: 'BLS' as const,
//       epoch: item.epoch,
//     })
//   );

/**
 * Prepare PKP Auth Request Body
 */
const preparePkpAuthRequestBody = async (params: {
  authentication: z.infer<typeof PkpAuthenticationSchema>;
  authorisation: z.infer<typeof PkpAuthorisationSchema>;
  sessionControl: z.infer<typeof PkpSessionControlSchema>;
  metadata: z.infer<typeof PkpMetadataSchema>;

  // dependencies from litNodeClient(must be generated internally, not provided by the user)
  deps: {
    nodeUrls: string[];
    nodeSet: NodeSet[];
    nonce: string;
    currentEpoch: number;
  };
}): Promise<z.output<typeof JsonSignSessionKeyRequestForPkpReturnSchema>> => {
  const _authentication = PkpAuthenticationSchema.parse(params.authentication);
  const _authorisation = PkpAuthorisationSchema.parse(params.authorisation);
  const _sessionControl = PkpSessionControlSchema.parse(params.sessionControl);
  const _metadata = PkpMetadataSchema.parse(params.metadata);

  // -- create sessionKeyPair
  const localSessionKeyPair = generateSessionKeyPair();

  // Auth Material (Siwe Message)
  const _siweMessage = await createPKPSiweMessage({
    pkpPublicKey: _authentication.pkpPublicKey,
    sessionKeyUri: localSessionKeyPair.sessionKeyUri,
    nonce: params.deps.nonce,

    // @ts-expect-error - sessionControl has a default in the schema, so it will never be "possibly undefined"
    expiration: _sessionControl.expiration,

    // @ts-expect-error - metadata has a default in the schema, so it will never be "possibly undefined"
    statement: _metadata.statement,
    domain: _authentication.domain,
    resources: _authorisation.resources,
  });

  return {
    nodeSet: params.deps.nodeSet,
    sessionKey: localSessionKeyPair.sessionKeyUri,
    authMethods: _authentication.authMethods,
    pkpPublicKey: _authentication.pkpPublicKey,
    siweMessage: _siweMessage,
    curveType: 'BLS' as const,
    signingScheme: 'BLS' as const,
    epoch: params.deps.currentEpoch,
  };
};

export const ConnectionSchema = z.object({
  nodeUrls: z.array(
    z.object({
      url: z.string(),
      price: z.bigint().optional(), // This only exists for Naga
    })
  ),
  nonce: z.string(),
  currentEpoch: z.number(),
});

/**
 * Get PKP Auth Context Schema
 */
export const GetPkpAuthContextSchema = createBaseAuthContextTypeSchema(
  PkpAuthenticationSchema,
  PkpAuthorisationSchema,
  PkpSessionControlSchema,
  PkpMetadataSchema
).extend({
  connection: ConnectionSchema,
  nodeSignSessionKey: z.function().args(
    z.object({
      requestBody: JsonSignSessionKeyRequestForPkpReturnSchema,
      nodeUrls: z.array(z.string()),
    })
  ),
});

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
  const _nodeInfo = NodeInfoSchema.parse(params.connection.nodeUrls);

  const requestBody = await preparePkpAuthRequestBody({
    authentication: _params.authentication,
    authorisation: _params.authorisation,
    sessionControl: _params.sessionControl,
    metadata: _params.metadata,
    deps: {
      nodeUrls: _nodeInfo.urls,
      nodeSet: _nodeInfo.nodeSet,
      nonce: _params.connection.nonce,
      currentEpoch: _params.connection.currentEpoch,
    },
  });

  // console.log(`[getPkpAuthContext] requestBody:`, requestBody);

  return {
    chain: 'ethereum',
    pkpPublicKey: _params.authentication.pkpPublicKey,
    authMethods: _params.authentication.authMethods,
    sessionKey: requestBody.sessionKey,
    resources: _params.authorisation.resources,
    capabilityAuthSigs: _params.authorisation.capabilityAuthSigs,
    // @ts-expect-error - sessionControl has a default in the schema, so it will never be ""possibly undefined"
    expiration: _params.sessionControl.expiration,
    authNeededCallback: async () => {
      const authSig = await _params.nodeSignSessionKey({
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
