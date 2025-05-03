import { generateSessionKeyPair } from '@lit-protocol/crypto';
import {
  ExpirationSchema,
  HexPrefixedSchema,
  NodeUrlsSchema,
  SignerSchema,
} from '@lit-protocol/schemas';
import {
  IRelay,
  MintRequestBody,
  OAuthProviderOptions,
} from '@lit-protocol/types';
import { ethers } from 'ethers';
import { z } from 'zod';
import { AuthConfigSchema } from './AuthManager/authContexts/BaseAuthContextType';
import { getEoaAuthContext } from './AuthManager/authContexts/getEoaAuthContext';
import { getPkpAuthContext } from './AuthManager/authContexts/getPkpAuthContext';
import type { LitAuthStorageProvider } from './storage/types';
import type { AuthMethodType, LitAuthData } from './types';
import { FactorParser } from './authenticators/stytch/parsers';
import type { LitClientType } from '@lit-protocol/lit-client';

export { AuthConfigSchema };

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
  litClient: LitClientType;
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

// Define this near the top of the file or in a shared types file
interface AuthenticatorWithId {
  new (config: any): any; // the constructor signature (maybe all the AuthConfigs eg. GoogleConfig?)
  id: AuthMethodType; // Or potentially AuthMethodType if that's more specific
  authenticate: Function; // Add this line
  register?: Function; // Technically only needed for webauthn
}

/**
 * Tries to retrieve cached authentication data from storage for a given address.
 * If no cached data is found, it generates a new session key pair, saves it
 * to storage, and returns the newly created auth data.
 * @returns {Promise<LitAuthData | null>} The cached or newly generated auth data, or null if no data is found.
 */
async function tryGetCachedAuthData(params: {
  storage: LitAuthStorageProvider;
  address: string;
  expiration: string;
  type: AuthMethodType;
}): Promise<LitAuthData> {
  console.log('params:', params);
  process.exit();

  // Use `storage` to see if there is cached auth data
  let authData = (await params.storage.read({
    address: params.address,
  })) as LitAuthData;

  if (!authData) {
    const _expiration = ExpirationSchema.parse(params.expiration);

    // generate session key pair
    authData = {
      sessionKey: {
        keyPair: generateSessionKeyPair(),
        expiresAt: _expiration,
      },
      authMethodType: params.type,
    };

    // save session key pair to storage
    await params.storage.write({
      address: params.address,
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

export type WebAuthnConfig = {
  pkpPublicKey: z.infer<typeof HexPrefixedSchema>;
  method: 'register' | 'authenticate';

  // register config
  relay: IRelay;
  username?: string;
  rpName?: string;
  customArgs?: MintRequestBody;
};

// -- Stytch Config
export type StytchOtpConfig = {
  pkpPublicKey: z.infer<typeof HexPrefixedSchema>;
  appId: string;
  accessToken: string;
  userId?: string;
  provider: string | 'https://stytch.com/session';
};

// -- Stytch Auth Factor Config
export type StytchAuthFactorOtpConfig = {
  pkpPublicKey: z.infer<typeof HexPrefixedSchema>;
  accessToken: string;
  factor: FactorParser;
};

// -- Custom Auth Config
export type CustomAuthConfig = {
  pkpPublicKey: z.infer<typeof HexPrefixedSchema>;
  litActionCode?: string; // Base64 encoded
  litActionIpfsId?: string;
  jsParams: Record<string, any>;
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

async function getPkpAuthContextAdapter<T extends AuthenticatorWithId>(
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

  // {
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
      connection: {
        nonce: litClientConfig.nonce,
        currentEpoch: litClientConfig.currentEpoch,
        nodeUrls: litClientConfig.nodeUrls,
      },
      nodeSignSessionKey: litClientConfig.getSignSessionKey,
    },
  });
}

// ----- Custom Auth Context Adapter -----

async function getCustomAuthContextAdapter(
  upstreamParams: AuthManagerParams,
  params: {
    config: CustomAuthConfig;
    authConfig: AuthConfig; // For SIWE details
    litClient: BaseAuthContext<any>['litClient'];
  }
) {
  // 1. Get node dependencies
  const litClientConfig = PkpAuthDepsSchema.parse({
    nonce: await params.litClient.getLatestBlockhash(),
    currentEpoch: await params.litClient.getCurrentEpoch(),
    getSignSessionKey: params.litClient.getSignSessionKey,
    nodeUrls: await params.litClient.getMaxPricesForNodeProduct({
      product: 'LIT_ACTION', // Or appropriate product
    }),
  });

  // 2. Get PKP Address and Session Key
  const pkpAddress = ethers.utils.computeAddress(params.config.pkpPublicKey);
  const authData = await tryGetCachedAuthData({
    storage: upstreamParams.storage,
    address: pkpAddress,
    expiration: params.authConfig.expiration,
    type: 'LitAction',
  });

  // 3. Prepare the arguments for the node signing function
  // This structure needs to align with what getPkpAuthContext uses for signSessionKey
  // It might involve calling a similar internal `preparePkpAuthRequestBody` function
  // adapted for custom auth, or constructing the body directly.

  // Example direct construction (adapt based on actual signPKPSessionKey V2 requirements):
  const requestBodyForCustomAuth = {
    // Fields required by signPKPSessionKey V2 when using custom auth
    sessionKey: authData.sessionKey.keyPair.publicKey, // Assuming URI is needed
    pkpPublicKey: params.config.pkpPublicKey,
    // -- SIWE related fields from authConfig
    statement: params.authConfig.statement,
    domain: params.authConfig.domain,
    expiration: params.authConfig.expiration,
    resources: params.authConfig.resources,
    uri: authData.sessionKey.keyPair.publicKey, // Assuming session key URI needed for SIWE
    nonce: litClientConfig.nonce,
    // -- Custom Auth specific fields
    ...(params.config.litActionCode && { code: params.config.litActionCode }),
    ...(params.config.litActionIpfsId && {
      litActionIpfsId: params.config.litActionIpfsId,
    }),
    jsParams: params.config.jsParams,
    // -- Other common fields
    authMethods: [], // Custom auth doesn't use verifiable authMethods in the same way
    epoch: litClientConfig.currentEpoch,
    // Fields like curveType, signingScheme may be needed depending on signPKPSessionKey V2
    // curveType: 'BLS',
    // signingScheme: 'BLS',
  };

  // 4. Return the context object with the callback
  return {
    chain: 'ethereum', // Assuming ethereum context
    pkpPublicKey: params.config.pkpPublicKey,
    // Include other relevant fields from authConfig if needed by the consuming application
    resources: params.authConfig.resources,
    capabilityAuthSigs: params.authConfig.capabilityAuthSigs,
    expiration: params.authConfig.expiration,
    // sessionKey: authData.sessionKey.keyPair.publicKey, // Expose session key if useful?

    // The callback invokes the node signing function with the prepared body
    authNeededCallback: async () => {
      // Adjust the call based on the actual signature of getSignSessionKey
      const authSig = await litClientConfig.getSignSessionKey({
        requestBody: requestBodyForCustomAuth,
        nodeUrls: litClientConfig.nodeUrls.map((node) => node.url),
      });
      return authSig;
    },
  };
}

export const getAuthManager = (authManagerParams: AuthManagerParams) => {
  return {
    getEoaAuthContext: getEoaAuthContextAdapter.bind(null, authManagerParams),
    getPkpAuthContext: <T extends AuthenticatorWithId>(params: {
      authenticator: T;
      config: ConstructorConfig<T>;
      authConfig: AuthConfig;
      litClient: BaseAuthContext<any>['litClient'];
    }) => getPkpAuthContextAdapter(authManagerParams, params),
    getCustomAuthContext: getCustomAuthContextAdapter.bind(
      null,
      authManagerParams
    ),
  };
};
