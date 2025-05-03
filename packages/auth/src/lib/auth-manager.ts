import {
  AuthMethod,
  BaseProviderOptions,
  OAuthProviderOptions,
} from '@lit-protocol/types';
import { ethers } from 'ethers';
import { z } from 'zod';
import {
  DiscordAuthenticator,
  EOAAuthenticator,
  GoogleAuthenticator,
  LitAuthAuthenticator,
  WebAuthnAuthenticator,
} from './authenticators';
import {
  getEoaAuthContext,
  GetEoaAuthContextSchema,
} from './AuthManager/authContexts/getEoaAuthContext';
import {
  getPkpAuthContext,
  GetPkpAuthContextSchema,
} from './AuthManager/authContexts/getPkpAuthContext';
import type { LitAuthStorageProvider } from './storage/types';
import type { AuthMethodType, LitAuthData } from './types';
import {
  AuthSigSchema,
  ExpirationSchema,
  HexPrefixedSchema,
  LitResourceAbilityRequestSchema,
  NodeUrlsSchema,
  SignerSchema,
  UrlSchema,
} from '@lit-protocol/schemas';
import { AuthConfigSchema } from './AuthManager/authContexts/BaseAuthContextType';
import { generateSessionKeyPair } from '@lit-protocol/crypto';
import { BaseAuthenticateConfig } from './authenticators/BaseAuthenticator';
import { WebAuthnPkpConfig } from './authenticators/WebAuthnAuthenticator';
import { AUTH_METHOD_TYPE } from '@lit-protocol/constants';

interface AuthManagerParams {
  storage: LitAuthStorageProvider;
}

/**
 * The auth context that both EOA and PKP auth contexts have in common.
 */
interface BaseAuthContext<T> {
  // authenticator: LitAuthAuthenticator;
  authConfig: z.infer<typeof AuthConfigSchema>;
  config: T;
  litClient: {
    getLatestBlockhash: () => Promise<string>;
    getCurrentEpoch: () => Promise<number>;
    getSignSessionKey: Function;
    getMaxPricesForNodeProduct: Function;
  };
}

/**
 * The EOA auth context adapter params.
 */
interface EoaAuthContextAdapterParams
  extends BaseAuthContext<{
    pkpPublicKey: string;
    signer: z.infer<typeof SignerSchema>;
  }> {}

/**
 * Defines the base structure for PKP Auth Context Adapter parameters,
 * excluding the parts that vary by authenticator.
 */
export interface BasePkpAuthContextAdapterParams {
  authConfig: AuthConfig;
  litClient: BaseAuthContext<any>['litClient'];
}

/**
 * Tries to retrieve cached authentication data from storage for a given address.
 * If no cached data is found, it generates a new session key pair, saves it
 * to storage, and returns the newly created auth data.
 * @returns {Promise<LitAuthData | null>} The cached or newly generated auth data, or null if no data is found.
 */
async function tryGetCachedAuthData({
  storage,
  address,
  expiration,
  type,
}: {
  storage: LitAuthStorageProvider;
  address: string;
  expiration: string;
  type: AuthMethodType;
}): Promise<LitAuthData> {
  // Use `storage` to see if there is cached auth data
  let authData = (await storage.read({
    address,
  })) as LitAuthData;

  if (!authData) {
    const _expiration = ExpirationSchema.parse(expiration);

    // generate session key pair
    authData = {
      sessionKey: {
        keyPair: generateSessionKeyPair(),
        expiresAt: _expiration,
      },
      authMethodType: type, // TODO: Should this be dynamic based on context?
    };

    // save session key pair to storage
    await storage.write({
      address: address,
      authData,
    });
  }

  if (!authData) {
    throw new Error('Failed to retrieve or generate authentication data.');
  }

  return authData;
}

async function tryGetAuthMethodFromAuthenticator() {
  // Use authenticator `getAuthMethod()` method to get a new auth method
}

function validateAuthData(authData: LitAuthData) {
  // Validate auth data is not expired, and is well-formed
}

// async function signSessionKey({ storage }: LitAuthManagerConfig) {
// Use LitNodeClient to signSessionKey with AuthData
// }

// type AuthManagerState = {
//   sessionKeyPair: SessionKeyPair | undefined;
// };

export type AuthConfig = z.infer<typeof AuthConfigSchema>;

export type EoaConfig = {
  pkpPublicKey: z.infer<typeof HexPrefixedSchema>;
  signer: z.infer<typeof SignerSchema>;
  domain?: string;
  origin?: string;
  // nonce: string;
};

export type GoogleConfig = OAuthProviderOptions & {
  pkpPublicKey: z.infer<typeof HexPrefixedSchema>;
};

export type DiscordConfig = OAuthProviderOptions & {
  pkpPublicKey: z.infer<typeof HexPrefixedSchema>;
  clientId?: string;
};

export const EoaAuthDepsSchema = z.object({
  nonce: z.any(),
});

export const PkpAuthDepsSchema = z.object({
  nonce: z.any(),
  currentEpoch: z.any(),
  getSignSessionKey: z.any(),
  nodeUrls: NodeUrlsSchema,
});

const getEoaAuthContextAdapter = async (
  upstreamParams: AuthManagerParams,
  params: EoaAuthContextAdapterParams
) => {
  const litClientConfig = EoaAuthDepsSchema.parse({
    nonce: await params.litClient.getLatestBlockhash(),
    // currentEpoch: no need for EOA
    // getSignSessionKey: no need for EOA
  });

  // Try to get LitAuthData from storage or generate a new one
  const authData = await tryGetCachedAuthData({
    storage: upstreamParams.storage,
    address: await params.config.signer.getAddress(),
    expiration: params.authConfig.expiration,
    type: 'EthWallet',
  });

  console.log('getEoaAuthContextAdapter - authData:', authData);

  // now use the actual getEoaAuthContext
  // we don't really care how messy the params look like, this adapter function will massage them into the correct shape
  return getEoaAuthContext({
    authentication: {
      pkpPublicKey: params.config.pkpPublicKey,
      signer: params.config.signer,
      signerAddress: await params.config.signer.getAddress(),
      sessionKeyPair: authData.sessionKey.keyPair,
    },
    authConfig: {
      domain: params.authConfig.domain,
      resources: params.authConfig.resources,
      capabilityAuthSigs: params.authConfig.capabilityAuthSigs,
      expiration: params.authConfig.expiration,
      statement: params.authConfig.statement,
    },
    deps: {
      nonce: litClientConfig.nonce,
    },
  });
};

type ConstructorConfig<T> = T extends new (config: infer C) => any ? C : never;

async function getPkpAuthContextAdapter<T extends new (config: any) => any>(
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

  const authData = await tryGetCachedAuthData({
    storage: upstreamParams.storage,
    address: pkpAddress,
    expiration: params.authConfig.expiration,
    type: 'EthWallet',
  });

  console.log('getPkpAuthContextAdapter - authData:', authData);

  const authenticator = new params.authenticator(params.config);

  // inject litClientConfig into params.config
  params.config = {
    ...params.config,
    ...litClientConfig,
  };

  const authMethod = await authenticator.authenticate(params.config);

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
      connection: {
        nonce: litClientConfig.nonce,
        currentEpoch: litClientConfig.currentEpoch,
        nodeUrls: litClientConfig.nodeUrls,
      },
      nodeSignSessionKey: litClientConfig.getSignSessionKey,
    },
  });
}

export const getAuthManager = (authManagerParams: AuthManagerParams) => {
  return {
    getEoaAuthContext: getEoaAuthContextAdapter.bind(null, authManagerParams),
    getPkpAuthContext: <T extends new (config: any) => any>(params: {
      authenticator: T;
      config: ConstructorConfig<T>;
      authConfig: AuthConfig;
      litClient: BaseAuthContext<any>['litClient'];
    }) => getPkpAuthContextAdapter(authManagerParams, params),
  };
};
