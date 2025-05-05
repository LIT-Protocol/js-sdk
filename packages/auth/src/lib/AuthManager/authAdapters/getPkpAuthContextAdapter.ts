import { NodeUrlsSchema } from '@lit-protocol/schemas';
import { ethers } from 'ethers';
import { z } from 'zod';
import { AuthMethodType } from '../../types';
import {
  AuthConfig,
  AuthManagerParams,
  BaseAuthContext,
  ConstructorConfig,
  tryGetCachedAuthData,
} from '../auth-manager';
import { getPkpAuthContext } from '../authContexts/getPkpAuthContext';

// Define this near the top of the file or in a shared types file
export interface AuthenticatorWithId {
  new (config: any): any; // the constructor signature (maybe all the AuthConfigs eg. GoogleConfig?)
  id: AuthMethodType; // Or potentially AuthMethodType if that's more specific
  authenticate: Function; // Add this line
  register?: Function; // Technically only needed for webauthn
}

export const PkpAuthDepsSchema = z.object({
  nonce: z.any(),
  currentEpoch: z.any(),
  getSignSessionKey: z.any(),
  nodeUrls: NodeUrlsSchema,
});

export async function getPkpAuthContextAdapter<T extends AuthenticatorWithId>(
  upstreamParams: AuthManagerParams,
  params: {
    authenticator: T;
    config: ConstructorConfig<T>;
    authConfig: AuthConfig;
    litClient: BaseAuthContext<any>['litClient'];
  }
) {
  const litClientConfig = PkpAuthDepsSchema.parse({
    nonce: await params.litClient.getLatestBlockhash(),
    currentEpoch: await params.litClient.getCurrentEpoch(),
    getSignSessionKey: params.litClient.getSignSessionKey,
    nodeUrls: await params.litClient.getMaxPricesForNodeProduct({
      product: 'LIT_ACTION',
    }),
  });

  const pkpAddress = ethers.utils.computeAddress(params.config.pkpPublicKey);

  // @example   {
  //   sessionKey: {
  //     keyPair: {
  //       publicKey: "bf8001bfdead23402d867d1acd965b45b405676a966db4237af11ba5eb85d7ce",
  //       secretKey: "9e19bd14bbc1bf4a6a0d08bd035d279702d31a6da159d52867441ae02e77ba02bf8001bfdead23402d867d1acd965b45b405676a966db4237af11ba5eb85d7ce",
  //     },
  //     expiresAt: "2025-05-02T16:06:19.195Z",
  //   },
  //   authMethodType: "EthWallet",
  // }
  const authData = await tryGetCachedAuthData({
    storage: upstreamParams.storage,
    address: pkpAddress,
    expiration: params.authConfig.expiration,
    type: params.authenticator.id,
  });

  const authenticator = new params.authenticator(params.config);

  // inject litClientConfig into params.config
  params.config = {
    ...params.config,
    ...litClientConfig,
  };

  let authMethod;

  // only for webauthn (maybe we can support other types)
  if (params.config.method === 'register') {
    authMethod = await authenticator.register(params.config);
  } else {
    authMethod = await authenticator.authenticate(params.config);
  }

  return getPkpAuthContext({
    authentication: {
      pkpPublicKey: params.config.pkpPublicKey,
      authMethods: [authMethod],
    },
    authConfig: {
      domain: params.authConfig.domain,
      resources: params.authConfig.resources,
      capabilityAuthSigs: params.authConfig.capabilityAuthSigs,
      expiration: params.authConfig.expiration,
      statement: params.authConfig.statement,
    },
    deps: {
      authData,
      connection: {
        nonce: litClientConfig.nonce,
        currentEpoch: litClientConfig.currentEpoch,
        nodeUrls: litClientConfig.nodeUrls,
      },
      nodeSignSessionKey: litClientConfig.getSignSessionKey,
    },
  });
}
