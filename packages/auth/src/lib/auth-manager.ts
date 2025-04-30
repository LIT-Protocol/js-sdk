import { z } from 'zod';
// import { getAuthContext } from './AuthManager/getAuthContext';
import type { LitAuthStorageProvider } from './storage/types';
import type { LitAuthData } from './types';
import { SessionKeyPair } from '@lit-protocol/types';
import {
  getPkpAuthContext,
  GetPkpAuthContextSchema,
} from './AuthManager/authContexts/getPkpAuthContext';
import {
  getEoaAuthContext,
  GetEoaAuthContextSchema,
} from './AuthManager/authContexts/getEoaAuthContext';
import { LOCAL_STORAGE_KEYS } from '@lit-protocol/constants';
import { LitAuthAuthenticators, MetamaskAuthenticator } from './authenticators';
// Define the strict authentication schema using the base schema
const StrictPkpAuthenticationSchema =
  GetPkpAuthContextSchema.shape.authentication
    .pick({
      pkpPublicKey: true,
      domain: true,
    })
    .strict();

/**
 * Configuration structure for using PKP-based authentication with AuthManager.
 */
export type PkpAuthManagerConfig = {
  /** The function to get the PKP authentication context. */
  contextGetter: typeof getPkpAuthContext;
  authenticator: LitAuthAuthenticators;
  /** The configuration object, strictly requiring only pkpPublicKey for authentication. */
  authentication: z.infer<typeof StrictPkpAuthenticationSchema>;
  authorisation: z.infer<typeof GetPkpAuthContextSchema.shape.authorisation>;
  connection: z.infer<typeof GetPkpAuthContextSchema.shape.connection>;
  nodeSignSessionKey: z.infer<
    typeof GetPkpAuthContextSchema.shape.nodeSignSessionKey
  >;
};

/**
 * Configuration structure for using EOA-based authentication with AuthManager.
 */
export type EoaAuthManagerConfig = {
  /** The function to get the EOA authentication context. */
  contextGetter: typeof getEoaAuthContext;
  /** The configuration object required by getEoaAuthContext. */
  // config: z.infer<typeof GetEoaAuthContextSchema>;
  config: any;
};

/**
 * A union type representing all possible authentication configurations
 * supported by AuthManager.
 */
export type AuthManagerConfigUnion =
  | PkpAuthManagerConfig
  | EoaAuthManagerConfig;

// interface LitAuthManagerConfig {
//   getAuthContext: typeof getAuthContext;
//   storage: LitAuthStorageProvider;
// }

async function tryGetCachedAuthData() {
  // Use `storage` to see if there is cached auth data
  // If error thrown trying to get it, error to caller or ??
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

// export function getAuthManager({ storage }: LitAuthManagerConfig) {
//   return {
//     getAuthContext,
//   };
// }

// type AuthManagerState = {
//   sessionKeyPair: SessionKeyPair | undefined;
// };

export const getAuthManager = async ({
  storage,
  auth,
}: {
  storage: LitAuthStorageProvider;
  auth: AuthManagerConfigUnion; // Use the union type here
}) => {
  console.log('authContextGetter:', auth.contextGetter.name);

  switch (auth.contextGetter.name) {
    case 'getPkpAuthContext': {
      const pkpAuth = auth as PkpAuthManagerConfig;
      const getter = pkpAuth.contextGetter;

      // TEMPORARY: Placeholder to illustrate the missing parts
      const fullConfigNeededByGetter = {
        authentication: pkpAuth.authentication, // This part is now strictly typed
        authorisation: {} as any, // Missing - Where does this come from now?
        sessionControl: {} as any, // Missing
        metadata: {} as any, // Missing
        connection: {} as any, // Missing
        nodeSignSessionKey: {} as any, // Missing
      };

      // Need to parse/validate fullConfigNeededByGetter against GetPkpAuthContextSchema
      // before passing to getter, or redesign getter itself.
      const authContext = await getter(
        fullConfigNeededByGetter as z.infer<typeof GetPkpAuthContextSchema>
      );
      return authContext;
    }
    case 'getEoaAuthContext': {
      const eoaAuth = auth as EoaAuthManagerConfig;
      const getter = eoaAuth.contextGetter as typeof getEoaAuthContext;
      const config = eoaAuth.config as z.infer<typeof GetEoaAuthContextSchema>;

      // modify the config if storage is provided
      //...

      const authContext = await getter(config);
      return authContext;
    }
    default:
      throw new Error(
        `Invalid auth context getter: ${auth.contextGetter.name}`
      );
  }

  // let state: AuthManagerState = {
  //   sessionKeyPair: undefined,
  // };

  return {
    // get: () => state,
    // restore: (nextState: AuthManagerState) => (state = nextState),
    // getAuthContext,
  };
};
