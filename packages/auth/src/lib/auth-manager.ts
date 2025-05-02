import { AuthMethod } from '@lit-protocol/types';
import { ethers } from 'ethers';
import { z } from 'zod';
import { EOAAuthenticator, LitAuthAuthenticator } from './authenticators';
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
import {
  AuthSigSchema,
  ExpirationSchema,
  LitResourceAbilityRequestSchema,
  SignerSchema,
} from '@lit-protocol/schemas';

// -- Specific Authenticator Config Types --
// type EOAAuthenticatorConfig = {
//   provider: typeof EOAAuthenticator;
//   options: {
//     signer:
//       | ethers.Signer
//       | {
//           signMessage: (message: string) => Promise<string>;
//           getAddress: () => Promise<string>;
//         };
//   };
// };

// Add other specific authenticator configs here, e.g.:
// type WebAuthnAuthenticatorConfig = {
//   method: typeof WebAuthnAuthenticator;
//   options: WebAuthnProviderOptions;
// };

// -- Discriminated Union for Authenticator Config --
// type AuthenticatorConfig = EOAAuthenticatorConfig; // Add others with | like EOAAuthenticatorConfig | WebAuthnAuthenticatorConfig

// Define the strict authentication schema using the base schema
// const StrictPkpAuthenticationSchema =
//   GetPkpAuthContextSchema.shape.authentication
//     .pick({
//       pkpPublicKey: true,
//       domain: true,
//     })
//     .strict();

/**
 * Configuration structure for using PKP-based authentication with AuthManager.
 * This does not fully mimic the GetPkpAuthContextSchema, but is a subset of it,
 * because the full config will be manipulated by AuthManager to add missing fields.
 */
// export type PkpAuthManagerConfig = {
//   contextGetter: typeof getPkpAuthContext;
//   authenticators: AuthenticatorConfig[]; // Use the discriminated union type here
//   authentication: z.infer<typeof StrictPkpAuthenticationSchema>;
//   authorisation: z.infer<typeof GetPkpAuthContextSchema.shape.authorisation>;
//   sessionControl?: z.infer<typeof GetPkpAuthContextSchema.shape.sessionControl>;
//   metadata?: z.infer<typeof GetPkpAuthContextSchema.shape.metadata>;
//   connection?: z.infer<typeof GetPkpAuthContextSchema.shape.connection>;
// };

/**
 * Configuration structure for using EOA-based authentication with AuthManager.
 * This does not fully mimic the GetPkpAuthContextSchema, but is a subset of it,
 * because the full config will be manipulated by AuthManager to add missing fields.
 */
// export type EoaAuthManagerConfig = {
//   contextGetter: typeof getEoaAuthContext;
// };

/**
 * A union type representing all possible authentication configurations
 * supported by AuthManager.
 */
// export type AuthManagerConfigUnion =
//   | PkpAuthManagerConfig
//   | EoaAuthManagerConfig;

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

export const AuthConfigSchema = z.object({
  capabilityAuthSigs: z.array(AuthSigSchema).optional().default([]),
  expiration: ExpirationSchema.optional().default(
    new Date(Date.now() + 1000 * 60 * 15).toISOString()
  ),
  statement: z.string().optional().default(''),
  resources: z.array(LitResourceAbilityRequestSchema).optional().default([]),
});

export type AuthConfig = z.infer<typeof AuthConfigSchema>;
interface BaseAuthContext {
  authenticator: LitAuthAuthenticator;
  authConfig: z.infer<typeof AuthConfigSchema>;

  // @deprecated - not deprecated, it's a TODO to fix this.
  litClient: {
    getLatestBlockhash: () => Promise<string>;
    getCurrentEpoch: () => Promise<number>;
    getSignSessionKey: Function;
  };
}

export const LitClientConfigSchema = z.object({
  nonce: z.any(),
  currentEpoch: z.any(),
  getSignSessionKey: z.any(),
});

const _getEoaAuthContext = async (
  params: BaseAuthContext & {
    signer: z.infer<typeof SignerSchema>;
  }
) => {
  console.log('params:', params);

  const litClientConfig = LitClientConfigSchema.parse({
    nonce: await params.litClient.getLatestBlockhash(),
    currentEpoch: await params.litClient.getCurrentEpoch(),
    getSignSessionKey: params.litClient.getSignSessionKey,
  });

  // now use the actual getEoaAuthContext
  return getEoaAuthContext({
    authentication: {
      pkpPublicKey: '0x0000000000000000000000000000000000000000',
      signer: params.signer,
      signerAddress: await params.signer.getAddress(),
    },
    authorisation: {
      resources: params.authConfig.resources,
      capabilityAuthSigs: params.authConfig.capabilityAuthSigs,
    },
    sessionControl: {
      expiration: params.authConfig.expiration,
    },
    metadata: {
      statement: params.authConfig.statement,
    },
    deps: {
      nonce: litClientConfig.nonce,
    },
  });
};

const _getPkpAuthContext = async (
  params: BaseAuthContext & {
    pkpAddress: string;
  }
) => {};

export const getAuthManager = ({
  storage,
}: // auth,
// connection,
// nodeAction,
{
  storage: LitAuthStorageProvider;
  // auth: AuthManagerConfigUnion; // Use the union type here,

  // this is shown an optional but is required by the LitClient
  // connection?: z.infer<typeof GetPkpAuthContextSchema.shape.connection>;
  // nodeAction?: z.infer<typeof GetPkpAuthContextSchema.shape.nodeSignSessionKey>;
}) => {
  // ===== V2 ======

  return {
    // getEoaAuthContext: _getEoaAuthContext.bind(null, undefined, { nonce }),
    getEoaAuthContext: _getEoaAuthContext,
    getPkpAuthContext: _getPkpAuthContext,
  };

  // ===== V1 ======
  // Remove immediate authContext calculation
  // let authContext;
  // let getAuthMethod;
  // Mapping authenticators internally????
  // switch (auth.contextGetter.name) {
  //   case 'getPkpAuthContext': {
  //     const config = auth as PkpAuthManagerConfig;
  //     const getter = config.contextGetter;
  //     // An async function for the user to call to get the auth context
  //     // NOTE: This is NOT called by the AuthManager, but by the user
  //     const getAuthContext = async ({
  //       authenticator,
  //       pkpAddress,
  //     }) => {
  //       // ============================== Resolve Auth Methods ==============================
  //       const authMethods = (
  //         await Promise.all(
  //           config.authenticators.map((authConfig) => {
  //             // Check if it's an EOAAuthenticator instance to call authenticate
  //             // A more robust type check or instanceof might be needed here
  //             // depending on the actual types and inheritance structure.
  //             if (authConfig.provider.id === EOAAuthenticator.id) {
  //               // Instantiate the authenticator, merging required options
  //               const _opts = {
  //                 signer: authConfig.options.signer,
  //                 nonce: connection!.nonce,
  //               };
  //               const authenticator = new authConfig.provider(_opts);
  //               return authenticator.authenticate(_opts);
  //             }
  //             return undefined;
  //           })
  //         )
  //       ).filter((provider): provider is AuthMethod => provider !== undefined);
  //       // ============================== Full Config Needed By Getter ==============================
  //       const fullConfigNeededByGetter: z.infer<
  //         typeof GetPkpAuthContextSchema
  //       > = {
  //         authentication: {
  //           pkpPublicKey: config.authentication.pkpPublicKey,
  //           authMethods: authMethods,
  //         },
  //         authorisation: {
  //           resources: config.authorisation.resources,
  //         },
  //         sessionControl: {
  //           expiration: config.sessionControl?.expiration!,
  //         },
  //         metadata: {
  //           statement: config.metadata?.statement!,
  //         },
  //         connection: connection!,
  //         nodeSignSessionKey: nodeAction!,
  //       };
  //       // Need to parse/validate fullConfigNeededByGetter against GetPkpAuthContextSchema
  //       // before passing to getter, or redesign getter itself.
  //       // Note: The original getter might be async or sync. Assuming async based on getEoaAuthContext.
  //       const authContext = await getter(
  //         fullConfigNeededByGetter as z.infer<typeof GetPkpAuthContextSchema>
  //       );
  //       return authContext;
  //     };
  //     return {
  //       // Return the function itself
  //       getAuthContext,
  //       // getAuthMethod, // Keep commented if not implemented yet
  //     };
  //   }
  //   case 'getEoaAuthContext': {
  //     const eoaAuth = auth as EoaAuthManagerConfig;
  //     const getter = eoaAuth.contextGetter as typeof getEoaAuthContext;
  //     const config = eoaAuth.provider as z.infer<typeof GetEoaAuthContextSchema>;
  //     // Define the async function to get the context later
  //     const getAuthContext = async () => {
  //       // modify the config if storage is provided
  //       //...
  //       const authContext = await getter(config);
  //       return authContext;
  //     };
  //     // getAuthMethod = eoaAuth.authenticator.authenticate.bind(
  //     //   eoaAuth.authenticator
  //     // );
  //     return {
  //       // Return the function itself
  //       getAuthContext,
  //       getAuthMethod: () => {}, // Keep placeholder if needed
  //     };
  //   }
  //   default:
  //     throw new Error(
  //       `Invalid auth context getter: ${auth.contextGetter.name}`
  //     );
  // }
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
