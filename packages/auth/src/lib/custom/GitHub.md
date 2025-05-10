# GitHub custom auth

The React app handles the user interaction and talks to your backend server. Your backend server securely handles the interaction with GitHub (using the client secret) and provides a verifiable proof (attestation) back to the React app. The React app then gives this proof to the Lit SDK, which uses a Lit Action to verify the proof is legitimate before granting a session.

1. What the Site Owner Implements & Stores

This primarily involves setting up the Backend Server.

## Implementation:

API Endpoint (e.g., /api/verify-github-code): This endpoint will:

- Receive an OAuth code and the target pkpPublicKey from the React frontend.
- Use its stored client_id and client_secret to securely exchange the code with GitHub for an access_token.
- Use the access_token to securely call GitHub's API (e.g., https://api.github.com/user) to get the verified githubUserId.
- Generate an Attestation: Create a message containing verified data (e.g., "${githubUserId}:${pkpPublicKey}:${Date.now()}").
- Sign the Attestation: Sign this message using the backend's private key.
- Return the verified githubUserId, the signature, and the signedMessage back to the React frontend.
- (Optional but Recommended): An endpoint to provide configuration like the GitHub client_id to the frontend if needed.

## Storage / Configuration (Backend):

- Environment Variables / Secret Manager (MUST be secure):
  - GITHUB_CLIENT_ID: Your application's GitHub Client ID.
  - GITHUB_CLIENT_SECRET: Your application's GitHub Client Secret (Never expose this to the frontend!).
  - SERVER_PRIVATE_KEY: The private key the backend uses to sign attestations for the Lit Action.
- Configuration (possibly public):
  - SERVER_PUBLIC_KEY: The public key corresponding to SERVER_PRIVATE_KEY. This needs to be known by the Lit Action for verification (it might be hardcoded in the Lit Action, or the action could potentially fetch it from a trusted URL).

# Example

```ts
import React, { useState, useEffect } from 'react';
import * as LitAuth from '@lit-protocol/auth';
import { GitHubCustomAuthenticator } from 'packages/auth/src/lib/custom/GitHubCustomAuthenticator'; // Adjust import path
import { getLitClient } from '@lit-protocol/lit-client';/ Your Lit Client setup helper
import { createResourceBuilder } from '@lit-protocol/auth-helpers';

// --- Configuration (Could come from backend or .env for client ID) ---
const GITHUB_CLIENT_ID = 'YOUR_GITHUB_CLIENT_ID'; // Replace
const APP_BACKEND_VERIFY_URL = '/api/verify-github-code'; // Your backend endpoint
const REDIRECT_URI = window.location.origin + '/callback'; // Or wherever you handle callback
const TARGET_PKP_PUBLIC_KEY = '0x...'; // The user's target PKP public key

function App() {
  const [litAuthContext, setLitAuthContext] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null); // To display something after login

  // --- Initialize AuthManager ---
  // Memoize or initialize outside component if needed
  const authManager = LitAuth.getAuthManager({
    storage: LitAuth.storagePlugins.localStorageNode({
      appName: 'my-github-app',
      networkName: 'naga-dev',
      storagePath: './lit-auth-storage-gh',
    }),
  });

  // --- Function to initiate GitHub Login ---
  const handleGitHubLogin = () => {
    // Construct the GitHub authorization URL
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=read:user`;
    window.location.href = authUrl; // Redirect user to GitHub
  };

  // --- Effect to handle the callback from GitHub ---
  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        setIsLoading(true);
        setError('');
        console.log('GitHub OAuth code detected:', code);

        // --- Config for the Lit SDK's getCustomAuthContext ---
        // Settings needed to construct GitHubCustomAuthenticator
        const authHelperSettings = {
          clientId: GITHUB_CLIENT_ID, // Only ClientID might be needed now
          redirectUri: REDIRECT_URI,
          backendVerifyUrl: APP_BACKEND_VERIFY_URL,
        };

        // Config needed for the GitHubCustomAuthenticator's authenticate method
        const authExecConfig = {
          pkpPublicKey: TARGET_PKP_PUBLIC_KEY,
          oauthCode: code, // Pass the code obtained from redirect
        };

        // Config for the overall session / SIWE message
        const sessionAuthConfig = {
          expiration: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1 hour
          statement: 'Login with GitHub via Lit Custom Auth',
          domain: window.location.hostname,
          resources: createResourceBuilder()
            .addPKPSigningRequest('*')
            .getResources(),
        };

        try {
          // Get Lit Client instance (ensure it's ready)
          const litClient = await getLitClient({ network: 'naga-dev' });

          // Call the AuthManager using the class, settings, and config
          const context = await authManager.getCustomAuthContext({
            authenticator: GitHubCustomAuthenticator,
            settings: authHelperSettings,
            config: authExecConfig,
            authConfig: sessionAuthConfig,
            litClient: litClient,
          });

          console.log('✅ Successfully obtained Lit Auth Context:', context);
          setLitAuthContext(context);
          // Optionally fetch user display info based on context/token
          // For demo, let's just indicate success
          setUserInfo({ pkpPublicKey: TARGET_PKP_PUBLIC_KEY });
        } catch (err) {
          console.error('❌ Error obtaining Lit Auth Context:', err);
          setError(err.message || 'Failed to authenticate with Lit.');
        } finally {
          setIsLoading(false);
          // Clean the URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }
      }
    };

    handleAuthCallback();
    // Run only once on component mount or if the search params change
  }, []); // Add dependencies if needed, e.g. [authManager]

  return (
    <div>
      <h1>Lit Protocol Custom GitHub Auth</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!litAuthContext && !isLoading && (
        <button onClick={handleGitHubLogin}>Login with GitHub</button>
      )}

      {litAuthContext && userInfo && (
        <div>
          <p>Login Successful!</p>
          <p>PKP Public Key: {userInfo.pkpPublicKey}</p>
          {/* Add buttons/actions that use the litAuthContext */}
          {/* Example: <button onClick={handleSign}>Sign Message</button> */}
        </div>
      )}
    </div>
  );
}

export default App;
```
