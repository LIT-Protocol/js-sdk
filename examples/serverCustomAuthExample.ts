import { ServerCustomAuthenticator } from 'packages/auth/src/lib/custom/ServerCustomAuthenticator';
import * as LitAuth from '@lit-protocol/auth';
import { createResourceBuilder } from '@lit-protocol/auth-helpers';
import { AuthConfig } from 'packages/auth/src/lib/AuthManager/auth-manager';
import { getLitClient } from '@lit-protocol/lit-client';
import { DEFAULT_EXPIRATION } from 'packages/auth/src/lib/AuthManager/authContexts/BaseAuthContextType';

/**
 * Server Custom Auth Example
 *
 * This example demonstrates how to use the ServerCustomAuthenticator
 * with AuthManager.getCustomAuthContext for custom authentication
 * using your own server's authentication system.
 */
(async () => {
  try {
    console.log('Starting Server Custom Auth Example...');

    // 1. Get auth manager with storage plugin
    const authManager = LitAuth.getAuthManager({
      storage: LitAuth.storagePlugins.localStorageNode({
        appName: 'my-app',
        networkName: 'naga-dev',
        storagePath: './lit-auth-storage',
      }),
    });

    // 2. Prepare auth config for SIWE message and session
    const myAuthConfig: AuthConfig = {
      expiration: DEFAULT_EXPIRATION,
      statement: 'Sign in with your server account',
      domain: 'example.com',
      capabilityAuthSigs: [],
      resources: createResourceBuilder()
        .addPKPSigningRequest('*')
        .getResources(),
    };

    // 3. Get lit client instance
    const litClient = await getLitClient({ network: 'naga-dev' });

    // Target PKP for this authentication
    const pkpPublicKey =
      '0x04e5603fe1cc5ce207c12950939738583b599f22a152c3672a4c0eee887d75dd405246ac3ed2430283935a99733eac9520581af9923c0fc04fad1d67d60908ce18';

    // 4. Define settings for the ServerCustomAuthenticator constructor
    const serverAuthSettings = {
      apiUrl: 'https://api.example.com/auth', // Your actual auth server URL
    };

    // 5. Define the config for the authenticator's authenticate method
    // This now contains the actual credentials to be sent to the Lit Action
    const serverAuthConfig = {
      pkpPublicKey,
      username: 'demo',
      password: 'password', // Pass credentials securely in a real app
    };

    console.log('Attempting server authentication via Lit Action...');

    // 6. Use the AuthManager with the new pattern
    try {
      const serverAuthContext = await authManager.getCustomAuthContext({
        authenticator: ServerCustomAuthenticator, // Pass the class
        settings: serverAuthSettings, // Pass constructor settings
        config: serverAuthConfig, // Pass execution config (credentials etc.)
        authConfig: myAuthConfig, // Pass SIWE/session config
        litClient, // Pass Lit Client dependencies
      });

      console.log(
        '✅ Server Custom Auth Context obtained (Corrected Pattern):',
        serverAuthContext
      );

      // Example of using the auth context for signing (uncomment to test)
      /*
      const messageToSign = new TextEncoder().encode("Hello from verified server auth!");
      const signature = await litClient.pkpSign({
        toSign: messageToSign,
        pubKey: pkpPublicKey,
        authContext: serverAuthContext,
      });
      console.log("✅ Signature using Server custom auth (Corrected Pattern):", signature);
      */
    } catch (error) {
      console.error(
        '❌ Failed to get Custom Auth Context (Corrected Pattern):',
        error
      );
    }
  } catch (error) {
    console.error('❌ Unexpected error in example:', error);
  }
})();
