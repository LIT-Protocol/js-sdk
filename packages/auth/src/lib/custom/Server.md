# Server Custom Auth (Username/Password Example)

This document explains how to implement custom authentication using Lit Protocol where the primary authentication mechanism is a traditional username/password verification handled by your own backend server.

**Core Idea:** The client application (e.g., a React app) gathers the username and password. These credentials are passed securely to a Lit Action via the AuthManager. The Lit Action then calls your backend server's authentication endpoint to verify the credentials. If the backend confirms the user is valid, the Lit Action approves the request, allowing Lit Protocol to issue session signatures.

## Flow Overview

1.  **Client:** Collects `username` and `password`.
2.  **Client:** Calls `authManager.getCustomAuthContext` with the `ServerCustomAuthenticator` helper, passing the credentials in the `config` object.
3.  **AuthManager:** Prepares parameters for the Lit Action, including the credentials and the backend API URL (from `settings`).
4.  **Lit Nodes:** Execute the `ServerCustomAuthenticator`'s Lit Action code.
5.  **Lit Action:** Uses `Lit.Actions.fetch` to call the specified backend API endpoint, sending the username and password for verification.
6.  **Backend Server:** Receives the credentials, verifies them against its user database.
7.  **Backend Server:** Responds to the Lit Action with a success (e.g., HTTP 200 OK) or failure status.
8.  **Lit Action:** Checks the backend's response status. If successful, calls `Lit.Actions.setResponse({ response: "true" })`.Ç
9.  **Lit Nodes:** If the action approved, generate and return the session signatures (`AuthSig`) back to the client via the `authContext`.

## 1. What the Site Owner Implements & Stores (Backend)

This involves setting up your **Backend Server**.

- **Implementation:**
  - **Authentication API Endpoint (e.g., `/api/verify-credentials`):** This endpoint MUST:
    - Accept `username` and `password` (typically via POST request body).
    - Securely verify these credentials against your user database (use strong password hashing like bcrypt or Argon2).
    - Return a clear success status (e.g., HTTP 200 OK) if credentials are valid.
    - Return an error status (e.g., HTTP 401 Unauthorized) if credentials are invalid.
    - **Important:** Ensure this endpoint uses **HTTPS** and is protected against brute-force attacks (e.g., rate limiting, account lockout).
- **Storage / Configuration (Backend):**
  - User database with securely hashed passwords.
  - Standard web server security practices.

## 2. Example React Login Flow

This shows how a React frontend might use the `ServerCustomAuthenticator` helper.

```jsx
import React, { useState } from 'react';
import * as LitAuth from '@lit-protocol/auth';
import { ServerCustomAuthenticator } from 'packages/auth/src/lib/custom/ServerCustomAuthenticator'; // Adjust import path
import { getLitClient } from './examples/getLitClient'; // Your Lit Client setup helper
import { createResourceBuilder } from '@lit-protocol/auth-helpers';

// --- Configuration ---
const APP_BACKEND_VERIFY_URL = '/api/verify-credentials'; // Your backend endpoint
const TARGET_PKP_PUBLIC_KEY = '0x...'; // Target PKP for the user

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [litAuthContext, setLitAuthContext] = useState(null);

  // Initialize AuthManager (consider memoization/context)
  const authManager = LitAuth.getAuthManager({
    storage: LitAuth.storagePlugins.localStorageNode({
      /* ... */
    }),
  });

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setLitAuthContext(null);

    // Settings for the ServerCustomAuthenticator constructor
    const authHelperSettings = {
      apiUrl: APP_BACKEND_VERIFY_URL,
    };

    // Config for the ServerCustomAuthenticator's authenticate method
    const authExecConfig = {
      pkpPublicKey: TARGET_PKP_PUBLIC_KEY,
      username: username,
      password: password, // Ideally, use a more secure method than sending raw password
    };

    // Config for the overall session / SIWE message
    const sessionAuthConfig = {
      expiration: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1 hour
      statement: 'Login with server account via Lit Custom Auth',
      domain: window.location.hostname,
      resources: createResourceBuilder()
        .addPKPSigningRequest('*')
        .getResources(),
    };

    try {
      const litClient = await getLitClient({ network: 'naga-dev' });

      // Call the AuthManager
      const context = await authManager.getCustomAuthContext({
        authenticator: ServerCustomAuthenticator,
        settings: authHelperSettings,
        config: authExecConfig,
        authConfig: sessionAuthConfig,
        litClient: litClient,
      });

      console.log('✅ Successfully obtained Lit Auth Context:', context);
      setLitAuthContext(context); // Store context for later use
    } catch (err) {
      console.error('❌ Error obtaining Lit Auth Context:', err);
      setError(err.message || 'Failed to authenticate with Lit.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Server Login</h2>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {litAuthContext ? (
        <div>
          <p>Login Successful!</p>
          <p>PKP Public Key: {TARGET_PKP_PUBLIC_KEY}</p>
          {/* Ready to use litAuthContext */}
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          <div>
            <label>Username: </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password: </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      )}
    </div>
  );
}

export default LoginForm;
```

## 3. The `ServerCustomAuthenticator.ts` Helper

This class definition remains largely the same as before, providing the structure and Lit Action code.

```typescript
// packages/auth/src/lib/custom/ServerCustomAuthenticator.ts
import { ethers } from 'ethers';

// JS Params for the Lit Action
interface ServerAuthJsParams {
  /* ... as defined previously ... */
}
// Settings for the constructor
interface ServerAuthenticatorSettings {
  /* ... as defined previously ... */
}
// Config for the authenticate method
interface ServerAuthConfig {
  /* ... as defined previously ... */
}

export class ServerCustomAuthenticator {
  private apiUrl: string;

  public static readonly AUTH_METHOD_TYPE_ID = 90002;
  public static readonly LIT_ACTION_CODE = `
    (async () => {
      const { username, password, apiUrl, authMethodType } = customAuthMethod;
      if (authMethodType !== ${ServerCustomAuthenticator.AUTH_METHOD_TYPE_ID} || !username || !password || !apiUrl) {
        LitActions.setResponse({ response: "false", error: "Missing required jsParams" });
        return;
      }
      let isVerified = false;
      try {
        console.log("[Lit Action] Calling verification server:", apiUrl);
        const response = await Lit.Actions.fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        if (response.ok) {
          console.log("[Lit Action] Server verification successful (Status: ", response.status, ")");
          isVerified = true;
        } else {
          console.error("[Lit Action] Server verification failed. Status:", response.status);
        }
      } catch (e) {
        console.error("[Lit Action] Error calling verification server:", e);
      }
      LitActions.setResponse({ response: isVerified ? "true" : "false" });
    })();
  `;
  public static readonly LIT_ACTION_CODE_BASE64 = Buffer.from(
    ServerCustomAuthenticator.LIT_ACTION_CODE
  ).toString('base64');

  constructor(settings: ServerAuthenticatorSettings) {
    this.apiUrl = settings.apiUrl;
  }

  async authenticate(
    config: ServerAuthConfig
  ): Promise<Record<string, any> | null> {
    try {
      const jsParams: ServerAuthJsParams = {
        customAuthMethod: {
          authMethodType: ServerCustomAuthenticator.AUTH_METHOD_TYPE_ID,
          username: config.username,
          password: config.password,
          apiUrl: this.apiUrl,
        },
        publicKey: config.pkpPublicKey,
        sigName: config.sigName || 'server-custom-auth-sig',
      };
      return jsParams;
    } catch (error) {
      console.error('Error preparing jsParams for server auth:', error);
      return null;
    }
  }
}
```

## Security Considerations

- **Password Handling:** Directly passing passwords in `jsParams` (as shown in the simple example) is **NOT RECOMMENDED** for production. The password travels from the client to the Lit Nodes before being sent to your backend. **Better Approach:** Have the client request a short-lived, single-use challenge or token from your backend first. The client passes this token in `jsParams`. The Lit Action then sends _this_ token to your backend for verification. This avoids sending the raw password through the Lit Network.
- **HTTPS:** Your backend API endpoint **MUST** use HTTPS.
- **Rate Limiting/Input Validation:** Protect your backend endpoint against brute-force attacks and other abuse.
- **Lit Action Code:** Remember the action code is public. Do not embed secrets. Security relies on the verification call it makes to your secure backend.
