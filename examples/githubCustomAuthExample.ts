import { GitHubCustomAuthenticator } from 'packages/auth/src/lib/custom/GitHubCustomAuthenticator';
import * as LitAuth from '@lit-protocol/auth';
import { createResourceBuilder } from '@lit-protocol/auth-helpers';
import { AuthConfig } from 'packages/auth/src/lib/AuthManager/auth-manager';
import { createLitClient } from '@lit-protocol/lit-client';
import { DEFAULT_EXPIRATION } from 'packages/auth/src/lib/AuthManager/authContexts/BaseAuthContextType';

(async () => {
  // 1. get auth manager providing your own storage solution
  const authManager = LitAuth.createAuthManager({
    storage: LitAuth.storagePlugins.localStorageNode({
      appName: 'my-app',
      networkName: 'naga-dev',
      storagePath: './lit-auth-storage',
    }),
  });

  // 2. prepare your own custom auth config
  const myAuthConfig: AuthConfig = {
    expiration: DEFAULT_EXPIRATION,
    statement: 'test',
    domain: 'example.com',
    capabilityAuthSigs: [],
    resources: createResourceBuilder().addPKPSigningRequest('*').getResources(),
  };

  // 3. get lit client
  const litClient = await createLitClient({ network: 'naga-dev' });

  // -- PKP Custom GitHub Auth Context --
  // This demonstrates the pattern, assuming browser environment for OAuth redirect

  const pkpForCustomAuth =
    '0x04e5603fe1cc5ce207c12950939738583b599f22a152c3672a4c0eee887d75dd405246ac3ed2430283935a99733eac9520581af9923c0fc04fad1d67d60908ce18'; // Target PKP

  // 4. Check if we are handling the OAuth redirect
  if (window.location.search.includes('code=')) {
    console.log('Handling GitHub OAuth redirect...');

    // 5. Define the config needed for the authenticator's authenticate method
    const authExecConfig = {
      pkpPublicKey: pkpForCustomAuth,
      // sigName: 'optional-sig-name' // Optionally pass sigName if needed
    };

    // 6. Call the SDK's getCustomAuthContext using the new signature
    try {
      const githubAuthContext = await authManager.getCustomAuthContext({
        authenticator: GitHubCustomAuthenticator, // Pass the class
        settings: {
          // Provide settings needed for the constructor
          clientId: 'MOCK_GITHUB_CLIENT_ID',
          // clientSecret: 'MOCK_GITHUB_SECRET', // REMOVED - Handled by backend
          redirectUri: window.location.origin,
          backendVerifyUrl: '/api/verify-github-code', // Added - Your backend endpoint
        },
        config: authExecConfig, // Provide config for the authenticate method
        authConfig: {
          ...myAuthConfig, // Reuse or customize SIWE details
          statement: 'Logging in via custom GitHub auth',
        },
        litClient: litClient,
      });

      console.log(
        '✅ Custom GitHub Auth Context obtained (Revised Pattern):',
        githubAuthContext
      );

      // Example: Use the context (uncomment to test)
      /*
      const messageToSign = ethers.utils.arrayify(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Hello Custom Auth")));
      const signature = await devEnv.litNodeClient.pkpSign({ // Replace devEnv.litNodeClient with your client instance
          toSign: messageToSign,
          pubKey: pkpForCustomAuth,
          authContext: githubAuthContext,
      });
      console.log("✅ Signature using GitHub custom auth:", signature);
      */
    } catch (error) {
      console.error(
        '❌ Failed to get Custom GitHub Auth Context (Revised Pattern):',
        error
      );
    }
    // Optional: Clear the code from the URL after handling
    // window.history.replaceState({}, document.title, window.location.pathname);
  } else {
    // 7. If not handling redirect, this is where you'd trigger the sign-in
    // Example: Attach to a button click
    // document.getElementById('github-login-button').onclick = () => gitHubAuthHelper.signIn();
    console.log(
      'GitHubCustomAuthenticator initialized. Ready to initiate sign-in (e.g., via button click calling signIn()).'
    );
  }
})();
