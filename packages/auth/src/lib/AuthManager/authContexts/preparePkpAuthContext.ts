import { LitNodeClient } from '@lit-protocol/lit-node-client';
import {
  AuthCallbackParams,
  AuthMethod,
  AuthSig,
  JsonSignSessionKeyRequestV2,
  LitResourceAbilityRequest,
  NodeSet,
  SessionKeyPair,
} from '@lit-protocol/types';
import { Hex } from 'viem';
import { BaseAuthContextType, BaseAuthMaterial, BaseIdentity } from './BaseAuthContextType';
import { AuthMethodSchema, SessionKeyPairSchema } from '@lit-protocol/schemas';
import { z } from 'zod';
import { LitAuthStorageProvider } from '../../storage/types';
import { createPKPSiweMessage } from '@lit-protocol/auth-helpers';
import { LIT_CURVE, LIT_CURVE_TYPE, SIWE_URI_PREFIX } from '@lit-protocol/constants';

interface PkpIdentity extends BaseIdentity {
  authMethods: z.infer<typeof AuthMethodSchema>[];
  sessionKey: z.infer<typeof SessionKeyPairSchema>;
}

interface PkpAuthMaterial extends BaseAuthMaterial {
  statement?: string;
  expiration: string;
}

/**
 * Interface for parameters required to get the native auth context.
 */
export interface PreparePkpAuthContextParams
  extends BaseAuthContextType<PkpIdentity, PkpAuthMaterial> {
  identity: PkpIdentity;
  authMaterial: PkpAuthMaterial;

  /**
   * The following are dependencies that were used to be provided by the litNodeClient
   */
  deps: {
    litNodeClient: LitNodeClient;
  };
}

export const preparePkpAuthRequestBody = async (params: {
  storageProvider?: LitAuthStorageProvider, // if provided, we will try to get it from local storage
  identity: {
    pkpPublicKey: string;
    sessionKeyPair: SessionKeyPair;
    authMethods: z.infer<typeof AuthMethodSchema>[];
  },
  authMaterial: {
    expiration: string; // In ISO string, maybe we can use Zod to parse the input
    statement?: string;
    resources?: LitResourceAbilityRequest[];
    domain?: string;
  },
  deps: {
    // litNodeClient: LitNodeClient;
    nodeUrls: string[],
    nodeSet: NodeSet[],
    nonce: string;
    currentEpoch: number;
  }
}): Promise<JsonSignSessionKeyRequestV2<LIT_CURVE_TYPE>> => {

  // -- dependencies from litNodeClient(must be generated internally, not provided by the user)
  // const nodeUrls = (await params.deps.litNodeClient.getMaxPricesForNodeProduct({
  //   product: 'LIT_ACTION'
  // })).map(node => node.url);

  // const _deps = {
  //   nonce: await params.deps.litNodeClient.getLatestBlockhash(),
  //   nodeSet: params.deps.litNodeClient.getNodeSet(nodeUrls),
  //   currentEpoch: params.deps.litNodeClient.currentEpochNumber,
  // }

  // Identity
  const _identity = {
    pkpPublicKey: params.identity.pkpPublicKey,
    session: {
      keyPair: params.identity.sessionKeyPair,
      uri: `${SIWE_URI_PREFIX.SESSION_KEY}${params.identity.sessionKeyPair.publicKey}`
    }
  }

  // Auth Material (Siwe Message)
  const _siweMessage = await createPKPSiweMessage({

    // identity
    pkpPublicKey: _identity.pkpPublicKey,
    sessionKeyUri: _identity.session.uri,

    // auth material
    ...params.authMaterial,

    // dependencies (must be generated internally, not provided by the user)
    nonce: params.deps.nonce,
  })

  const requestBody: JsonSignSessionKeyRequestV2<LIT_CURVE_TYPE> = {
    nodeSet: params.deps.nodeSet,
    sessionKey: _identity.session.uri,
    authMethods: params.identity.authMethods,
    pkpPublicKey: params.identity.pkpPublicKey,
    siweMessage: _siweMessage,
    curveType: LIT_CURVE.BLS,
    signingScheme: LIT_CURVE.BLS,
  }

  return requestBody;

}

// always take a provider
/**
 * Get the auth context for a Lit supported native auth method (eg. WebAuthn, Discord, Google).
 * This context is needed for requesting session signatures with PKP-based authentication.
 *
 * @param {PreparePkpAuthContextParams} params - Parameters for getting the native auth context.
 */
export const preparePkpAuthContext = async (params: PreparePkpAuthContextParams) => {

  // -- dependencies ideally from other packages
  const targetNodePrices = await params.deps.litNodeClient.getMaxPricesForNodeProduct({
    product: 'LIT_ACTION'
  });

  const nodeUrls = targetNodePrices.map(node => node.url);
  const nodeSet = params.deps.litNodeClient.getNodeSet(nodeUrls);
  const nonce = await params.deps.litNodeClient.getLatestBlockhash();
  const currentEpoch = params.deps.litNodeClient.currentEpochNumber!;

  return {
    chain: 'ethereum',
    pkpPublicKey: params.identity.pkpPublicKey,
    resources: params.authMaterial.resources,
    capabilityAuthSigs: params.authMaterial.capabilityAuthSigs,
    authMethods: params.identity.authMethods,
    expiration: params.authMaterial.expiration,
    sessionKey: params.identity.sessionKey,
    authNeededCallback: async () => {

      const requestBody = await preparePkpAuthRequestBody({
        identity: {
          pkpPublicKey: params.identity.pkpPublicKey,
          sessionKeyPair: params.identity.sessionKey,
          authMethods: params.identity.authMethods,
        },
        authMaterial: {
          expiration: params.authMaterial.expiration,
          statement: params.authMaterial.statement,
          resources: params.authMaterial.resources,
        },
        deps: {
          nodeUrls: nodeUrls,
          nodeSet: nodeSet,
          nonce: nonce,
          currentEpoch: currentEpoch,
        }
      });

      const authSig = await params.deps.litNodeClient.v2.signPKPSessionKey(
        requestBody,
        nodeUrls
      );

      return authSig;

      // const authSig = await params.deps.litNodeClient.v2.signPKPSessionKey({
      //   nodeUrls,
      //   sessionUri: `${SIWE_URI_PREFIX.SESSION_KEY}${params.identity.sessionKey.publicKey}`,
      //   authMethods: params.identity.authMethods,
      //   pkpPublicKey: params.identity.pkpPublicKey,
      //   siweMessage: _siweMessage,
      // });
      // const response = await params.deps.litNodeClient.signSessionKey({
      //   sessionKey: params.identity.sessionKey,
      //   statement: 'some custom statement', // TODO: make this dynamic
      //   authMethods: params.identity.authMethods,
      //   pkpPublicKey: params.identity.pkpPublicKey,
      //   expiration: params.identity.expiration,
      //   resources: params.resources,
      //   chainId: 1,
      // });
      // return response.authSig;
    },
  };
};
