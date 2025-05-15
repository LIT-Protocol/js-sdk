import { generateSessionKeyPair } from '@lit-protocol/crypto';
import {
  ExpirationSchema,
  HexPrefixedSchema,
  SignerSchema,
} from '@lit-protocol/schemas';
import { z } from 'zod';
import type { LitAuthStorageProvider } from '../storage/types';
import type { AuthMethodType, LitAuthData } from '../types';
import {
  getCustomAuthContextAdapter,
  ICustomAuthenticator,
} from './authAdapters/getCustomAuthContextAdapter';
import { getEoaAuthContextAdapter } from './authAdapters/getEoaAuthContextAdapter';
import {
  AuthenticatorWithId,
  getPkpAuthContextAdapter,
} from './authAdapters/getPkpAuthContextAdapter';
import { AuthConfigSchema } from './authContexts/BaseAuthContextType';

export interface AuthManagerParams {
  storage: LitAuthStorageProvider;
}

/**
 * The auth context that both EOA and PKP auth contexts have in common.
 */
export interface BaseAuthContext<T> {
  // authenticator: LitAuthAuthenticator;
  authConfig: z.infer<typeof AuthConfigSchema>;
  config: T;

  // @ts-expect-error - LitClientType is not defined in the package. We need to define this
  // once the LitClienType is ready
  litClient: ReturnType<typeof getLitClient>;
}

/**
 * Defines the base structure for PKP Auth Context Adapter parameters,
 * excluding the parts that vary by authenticator.
 */
export interface BasePkpAuthContextAdapterParams {
  authConfig: AuthConfig;
  litClient: BaseAuthContext<any>['litClient'];
}

// ----- Helper Functions -----
/**
 * Tries to retrieve cached authentication data from storage for a given address.
 * If no cached data is found, it generates a new session key pair, saves it
 * to storage, and returns the newly created auth data.
 * @returns {Promise<LitAuthData | null>} The cached or newly generated auth data, or null if no data is found.
 */
export async function tryGetCachedAuthData(params: {
  storage: LitAuthStorageProvider;
  address: string;
  expiration: string;
  type: AuthMethodType;
}): Promise<LitAuthData> {
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

export type AuthConfig = z.infer<typeof AuthConfigSchema>;

export type ConstructorConfig<T> = T extends new (config: infer C) => any
  ? C
  : never;

export const getAuthManager = (authManagerParams: AuthManagerParams) => {
  return {
    createEoaAuthContext: <
      T extends BaseAuthContext<{
        signer: z.infer<typeof SignerSchema>;
        // pkpPublicKey: z.infer<typeof HexPrefixedSchema>;
      }>
    >(params: {
      config: T['config'];
      authConfig: AuthConfig;
      litClient: T['litClient'];
    }) => getEoaAuthContextAdapter(authManagerParams, params),
    getPkpAuthContext: <T extends AuthenticatorWithId>(params: {
      authenticator: T;
      config: ConstructorConfig<T>;
      authConfig: AuthConfig;
      litClient: BaseAuthContext<any>['litClient'];
    }) => getPkpAuthContextAdapter(authManagerParams, params),
    getCustomAuthContext: <T extends ICustomAuthenticator>(params: {
      authenticator: T;
      settings: ConstructorParameters<T>[0]; // Infer settings type from constructor
      config: { pkpPublicKey: string; [key: string]: any }; // Execution config
      authConfig: AuthConfig;
      litClient: BaseAuthContext<any>['litClient'];
    }) => getCustomAuthContextAdapter(authManagerParams, params),
  };
};
