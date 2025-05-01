import { z } from 'zod';
import { EOAAuthenticator } from './authenticators';
import { ethers } from 'ethers';
import {
  getEoaAuthContext,
  GetEoaAuthContextSchema,
} from './AuthManager/authContexts/getEoaAuthContext';
import {
  getPkpAuthContext,
  GetPkpAuthContextSchema,
} from './AuthManager/authContexts/getPkpAuthContext';
import type { LitAuthStorageProvider } from './storage/types';
import type { LitAuthData } from './types';
import { AuthMethod } from '@lit-protocol/types';

// -- Specific Authenticator Config Types --
type EOAAuthenticatorConfig = {
  method: typeof EOAAuthenticator;
  options: {
    signer:
      | ethers.Signer
      | {
          signMessage: (message: string) => Promise<string>;
          getAddress: () => Promise<string>;
        };
  };
};

// Add other specific authenticator configs here, e.g.:
// type WebAuthnAuthenticatorConfig = {
//   method: typeof WebAuthnAuthenticator;
//   options: WebAuthnProviderOptions;
// };

// -- Discriminated Union for Authenticator Config --
type AuthenticatorConfig = EOAAuthenticatorConfig; // Add others with | like EOAAuthenticatorConfig | WebAuthnAuthenticatorConfig

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
 * This does not fully mimic the GetPkpAuthContextSchema, but is a subset of it,
 * because the full config will be manipulated by AuthManager to add missing fields.
 */
export type PkpAuthManagerConfig = {
  contextGetter: typeof getPkpAuthContext;
  authenticators: AuthenticatorConfig[]; // Use the discriminated union type here
  authentication: z.infer<typeof StrictPkpAuthenticationSchema>;
  authorisation: z.infer<typeof GetPkpAuthContextSchema.shape.authorisation>;
  sessionControl?: z.infer<typeof GetPkpAuthContextSchema.shape.sessionControl>;
  metadata?: z.infer<typeof GetPkpAuthContextSchema.shape.metadata>;
  connection?: z.infer<typeof GetPkpAuthContextSchema.shape.connection>;
};

/**
 * Configuration structure for using EOA-based authentication with AuthManager.
 * This does not fully mimic the GetPkpAuthContextSchema, but is a subset of it,
 * because the full config will be manipulated by AuthManager to add missing fields.
 */
export type EoaAuthManagerConfig = {
  contextGetter: typeof getEoaAuthContext;
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

export const getAuthManager = ({
  storage,
  auth,
  connection,
  nodeAction,
}: {
  storage: LitAuthStorageProvider;
  auth: AuthManagerConfigUnion; // Use the union type here,

  // this is shown an optional but is required by the LitClient
  connection?: z.infer<typeof GetPkpAuthContextSchema.shape.connection>;
  nodeAction?: z.infer<typeof GetPkpAuthContextSchema.shape.nodeSignSessionKey>;
}) => {
  // Remove immediate authContext calculation
  // let authContext;
  // let getAuthMethod;

  switch (auth.contextGetter.name) {
    case 'getPkpAuthContext': {
      const config = auth as PkpAuthManagerConfig;
      const getter = config.contextGetter;

      // An async function for the user to call to get the auth context
      // NOTE: This is NOT called by the AuthManager, but by the user
      const getAuthContext = async () => {
        // get the auth method using the authenticator
        const authMethods = (
          await Promise.all(
            config.authenticators.map((authConfig) => {
              // Check if it's an EOAAuthenticator instance to call authenticate
              // A more robust type check or instanceof might be needed here
              // depending on the actual types and inheritance structure.
              if (authConfig.method.id === EOAAuthenticator.id) {
                // Instantiate the authenticator, merging required options
                const opts = {
                  ...authConfig.options,
                  nonce: connection!.nonce,
                };
                const authenticator = new authConfig.method(opts);

                return authenticator.authenticate(opts);
              }

              return undefined;
            })
          )
        ).filter((method): method is AuthMethod => method !== undefined);

        const fullConfigNeededByGetter: z.infer<
          typeof GetPkpAuthContextSchema
        > = {
          authentication: {
            pkpPublicKey: config.authentication.pkpPublicKey,
            authMethods: authMethods,
          },
          authorisation: {
            resources: config.authorisation.resources,
          },
          sessionControl: {
            expiration: config.sessionControl?.expiration!,
          },
          metadata: {
            statement: config.metadata?.statement!,
          },
          connection: connection!,
          nodeSignSessionKey: nodeAction!,
        };

        // Need to parse/validate fullConfigNeededByGetter against GetPkpAuthContextSchema
        // before passing to getter, or redesign getter itself.
        // Note: The original getter might be async or sync. Assuming async based on getEoaAuthContext.
        const authContext = await getter(
          fullConfigNeededByGetter as z.infer<typeof GetPkpAuthContextSchema>
        );
        return authContext;
      };

      return {
        // Return the function itself
        getAuthContext,
        // getAuthMethod, // Keep commented if not implemented yet
      };
    }
    case 'getEoaAuthContext': {
      const eoaAuth = auth as EoaAuthManagerConfig;
      const getter = eoaAuth.contextGetter as typeof getEoaAuthContext;
      const config = eoaAuth.config as z.infer<typeof GetEoaAuthContextSchema>;

      // Define the async function to get the context later
      const getAuthContext = async () => {
        // modify the config if storage is provided
        //...

        const authContext = await getter(config);
        return authContext;
      };

      // getAuthMethod = eoaAuth.authenticator.authenticate.bind(
      //   eoaAuth.authenticator
      // );
      return {
        // Return the function itself
        getAuthContext,
        getAuthMethod: () => {}, // Keep placeholder if needed
      };
    }
    default:
      throw new Error(
        `Invalid auth context getter: ${auth.contextGetter.name}`
      );
  }

  // This part is now unreachable due to returns inside the switch cases
  // // let state: AuthManagerState = {
  // //   sessionKeyPair: undefined,
  // // };

  // return {
  //   // get: () => state,
  //   // restore: (nextState: AuthManagerState) => (state = nextState),
  //   authContext,
  //   // getAuthMethod,
  // };
};
