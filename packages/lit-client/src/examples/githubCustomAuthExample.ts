import { GitHubCustomAuthenticator } from 'packages/auth/src/lib/custom/GitHubCustomAuthenticator';
import * as LitAuth from '@lit-protocol/auth';
import { createResourceBuilder } from '@lit-protocol/auth-helpers';
import { AuthConfig } from 'packages/auth/src/lib/auth-manager';
import { getLitClient } from './getLitClient';

(async () => {
  // 1. get auth manager providing your own storage solution
  const authManager = LitAuth.getAuthManager({
    storage: LitAuth.storagePlugins.localStorageNode({
      appName: 'my-app',
      networkName: 'naga-dev',
      storagePath: './lit-auth-storage',
    }),
  });

  // 2. prepare your own custom auth config
  const myAuthConfig: AuthConfig = {
    expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(), // 15 miniutes
    statement: 'test',
    domain: 'example.com',
    capabilityAuthSigs: [],
    resources: createResourceBuilder().addPKPSigningRequest('*').getResources(),
  };

  // 3. get lit client
  const litClient = await getLitClient({ network: 'naga-dev' });

  // -- PKP Custom GitHub Auth Context --
  // This demonstrates the pattern, assuming browser environment for OAuth redirect

  const pkpForCustomAuth =
    '0x04e5603fe1cc5ce207c12950939738583b599f22a152c3672a4c0eee887d75dd405246ac3ed2430283935a99733eac9520581af9923c0fc04fad1d67d60908ce18'; // Target PKP

  // 1. Instantiate the developer-defined helper
  const gitHubAuthHelper = new GitHubCustomAuthenticator({
    clientId: 'MOCK_GITHUB_CLIENT_ID', // Replace with your app's ID
    clientSecret: 'MOCK_GITHUB_SECRET', // !! Keep server-side in real apps !!
    redirectUri: window.location.origin, // Or your specific redirect handler URL
  });

  // 2. Check if we are handling the OAuth redirect
  if (window.location.search.includes('code=')) {
    console.log('Handling GitHub OAuth redirect...');
    // 3. Prepare jsParams using the helper (simulates backend verification)
    const jsParams = await gitHubAuthHelper.handleRedirectAndPrepareJsParams(
      pkpForCustomAuth
    );

    if (jsParams) {
      // 4. Call the SDK's getCustomAuthContext
      try {
        const githubAuthContext = await authManager.getCustomAuthContext({
          config: {
            pkpPublicKey: pkpForCustomAuth,
            // Provide either the code or the IPFS ID
            litActionCode: GitHubCustomAuthenticator.LIT_ACTION_CODE_BASE64,
            // litActionIpfsId: GitHubCustomAuthenticator.LIT_ACTION_IPFS_ID, // If using IPFS
            jsParams: jsParams,
          },
          authConfig: {
            ...myAuthConfig, // Reuse or customize SIWE details
            statement: 'Logging in via custom GitHub auth',
          },
          litClient: litClient,
        });

        console.log(
          '✅ Custom GitHub Auth Context obtained:',
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
        console.error('❌ Failed to get Custom GitHub Auth Context:', error);
      }
    } else {
      console.error('❌ Failed to prepare jsParams after GitHub redirect.');
    }
    // Optional: Clear the code from the URL after handling
    // window.history.replaceState({}, document.title, window.location.pathname);
  } else {
    // 5. If not handling redirect, this is where you'd trigger the sign-in
    // Example: Attach to a button click
    // document.getElementById('github-login-button').onclick = () => gitHubAuthHelper.signIn();
    console.log(
      'GitHubCustomAuthenticator initialized. Ready to initiate sign-in (e.g., via button click calling signIn()).'
    );
  }
})();
