import './lib/polyfills/buffer';

// -- imports
// import { createAuthManager } from './lib/auth-manager';
import * as authenticators from './lib/authenticators';
import { WebAuthnAuthenticator } from './lib/authenticators';
import { DiscordAuthenticator } from './lib/authenticators/native/DiscordAuthenticator';
import { GoogleAuthenticator } from './lib/authenticators/native/GoogleAuthenticator';
import { StytchEmailOtpAuthenticator } from './lib/authenticators/stytch/factors/StytchEmailOtpAuthenticator';
import { StytchSmsOtpAuthenticator } from './lib/authenticators/stytch/factors/StytchSmsOtpAuthenticator';
import { StytchTotp2FAAuthenticator } from './lib/authenticators/stytch/factors/2fa/StytchTotp2FAAuthenticator';

import { StytchWhatsAppOtpAuthenticator } from './lib/authenticators/stytch/factors/StytchWhatsAppOtpAuthenticator';
import { ViemAccountAuthenticator } from './lib/authenticators/ViemAccountAuthenticator';
import { WalletClientAuthenticator } from './lib/authenticators/WalletClientAuthenticator';
// import { GetAuthContext } from './lib/AuthManager/getAuthContext';
import { localStorage } from './lib/storage/localStorage';
import type { LitAuthStorageProvider } from './lib/storage/types';
import type { LitAuthData } from './lib/types';

// -- exports
export { JsonSignSessionKeyRequestForPkpReturnSchema } from '@lit-protocol/schemas';
/**
 * Type definition for a storage provider compatible with the Lit Auth client.
 * Storage providers are used to cache authentication data.
 */
export type { LitAuthStorageProvider };

/**
 * Type definition for the structure of authentication data used within the Lit Auth client.
 */
export type { LitAuthData };

/**
 * Type definition for the structure of authentication context used within the Lit Auth client.
 */
// export type { GetAuthContext };

/**
 * A collection of available storage plugins.
 * Currently includes:
 * - `localStorage`: Uses the browser's localStorage API.
 * - For Node.js storage, use `@lit-protocol/auth/storage-node`.
 */
export const storagePlugins = {
  localStorage,
};

/**
 * A collection of available authenticator classes and utility functions.
 * Authenticators handle the process of verifying user identity via different methods (e.g., WebAuthn, OAuth, Stytch).
 */
export { createAuthManager } from './lib/AuthManager/auth-manager';
export { authenticators };
// export type {
//   AuthManagerConfigUnion,
//   PkpAuthManagerConfig,
//   EoaAuthManagerConfig,
// } from './lib/auth-manager';

/**
 * Factory function to create and configure an instance of the Auth Manager.
 * The Auth Manager orchestrates the authentication flows, caching, and session management.
 *
 * @param {object} config - Configuration object for the Auth Manager.
 * @param {LitAuthStorageProvider} config.storage - The storage provider instance to use for caching.
 * @returns An instance of the Auth Manager.
 */
// export { createAuthManager } from './lib/auth-manager';
// export { getAuthContext } from './lib/AuthManager/getAuthContext';
export { getEoaAuthContext } from './lib/AuthManager/authContexts/getEoaAuthContext';
export { getPkpAuthContext } from './lib/AuthManager/authContexts/getPkpAuthContext';
/**
 * Class responsible for communicating with the Lit Relay server.
 * Used for operations like minting PKPs associated with authentication methods.
 */
// export { LitRelay } from './lib/relay'; // Assuming LitRelay is exported from relay.ts now based on context

// ============================== UTILS ==============================
/**
 * Utility function to compute a unique identifier for a given authentication method.
 *
 * @param {AuthMethod} authMethod - The authentication method object.
 * @returns {string} The unique authentication ID.
 */
export { getAuthIdByAuthMethod } from './lib/authenticators/helper/utils';

/**
 * Utility function to generate a session key pair.
 *
 * @returns {SessionKeyPair} The generated session key pair.
 */
export { generateSessionKeyPair } from './lib/AuthManager/utils/generateSessionKeyPair';
export { validateDelegationAuthSig } from './lib/AuthManager/utils/validateDelegationAuthSig';

/**
 * Utility function to generate a PKP delegation auth signature for a given session key pair.
 * The PKP will sign the session key delegation message via Lit nodes.
 * This function is useful for server-side scenarios where you want to pre-generate
 * PKP session materials and reuse them across multiple requests.
 */
export { generatePkpDelegationAuthSig } from './lib/AuthManager/authAdapters/generatePkpDelegationAuthSig';

/**
 * Utility function to generate an EOA delegation auth signature for a given session key pair.
 * The EOA wallet will sign the session key delegation message directly.
 * This function is useful for server-side scenarios where you want to pre-generate
 * EOA session materials and reuse them across multiple requests.
 */
export { generateEoaDelegationAuthSig } from './lib/AuthManager/authAdapters/generateEoaDelegationAuthSig';

/**
 * Utility function to create a PKP auth context from pre-generated session materials.
 * This is a streamlined API for server-side scenarios where session materials
 * are generated once and reused across multiple requests.
 *
 * This function only requires the essential parameters (pkpPublicKey, sessionKeyPair, delegationAuthSig)
 * and extracts auth config information from the delegation signature automatically.
 */
export { getPkpAuthContextFromPreGeneratedAdapter } from './lib/AuthManager/authAdapters/getPkpAuthContextFromPreGeneratedAdapter';

// ============================== Authenticators ==============================
export {
  DiscordAuthenticator,
  GoogleAuthenticator,
  ViemAccountAuthenticator,
  WalletClientAuthenticator,
  WebAuthnAuthenticator,
  StytchEmailOtpAuthenticator,
  StytchSmsOtpAuthenticator,
  StytchTotp2FAAuthenticator,
  StytchWhatsAppOtpAuthenticator,
};

export { ExampleAppAuthenticator } from './lib/authenticators/custom/ExampleAppAuthenticator';
