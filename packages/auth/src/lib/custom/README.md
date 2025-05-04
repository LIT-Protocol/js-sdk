# Creating Custom Authenticators for Lit Protocol AuthManager

This document explains how to create your own custom authentication methods to integrate with Lit Protocol using the `AuthManager`'s `getCustomAuthContext` function. This allows you to use virtually any authentication system (your own backend, unsupported OAuth providers, etc.) to control access to PKPs.

The core idea is to use a Lit Action as a decentralized verification function. Your client application prepares parameters (`jsParams`), and the Lit Action uses these parameters to verify the authentication attempt, often by communicating with your backend or verifying a signature.

See the specific examples for different authentication flows:

*   **[Server Authentication (e.g., Username/Password)](./Server.md):** The Lit Action calls your backend API to verify credentials.
*   **[OAuth Provider (e.g., GitHub)](./GitHub.md):** Your backend verifies the OAuth token and provides a signed attestation, which the Lit Action then verifies.

## Overview

Implementing a custom authenticator involves two main parts:

1.  **Custom Authenticator Helper Class (Client-Side):** A TypeScript class you write to manage the specific authentication flow (e.g., interacting with your server, handling OAuth redirects) and prepare the `jsParams` for the Lit Action.
2.  **Lit Action Code (Decentralized Verification):** JavaScript code embedded within your helper class (as a static string/base64) that runs on the Lit nodes. This code performs the actual verification based on the `jsParams` provided.

## General Steps to Create a Custom Authenticator

### 1. Define the Helper Class Structure

Create a TypeScript class (e.g., `MyCustomAuthenticator`) that adheres to the following conceptual structure expected by `AuthManager.getCustomAuthContext`:

```typescript
import { ethers } from 'ethers'; // Or other necessary imports

// Define the structure of JS parameters your Lit Action will need
interface MyJsParams {
  customAuthMethod: {
    authMethodType: number;
    // Parameters specific to your auth method needed by the Lit Action
    // Eg: userId, signedToken, nonce, timestamp etc.
  };
  publicKey: string; // Target PKP Public Key
  sigName: string;   // Signature name for Lit Action operations
}

// Define the structure for settings needed to construct your helper
interface MyAuthenticatorSettings {
  // Eg: apiUrl, apiKey, configuration details...
}

// Define the structure for the config needed by the authenticate method
interface MyAuthConfig {
  pkpPublicKey: string;
  // Parameters needed to execute the authentication flow
  // Eg: username, password, oauthCode, etc.
  [key: string]: any; // Allow other relevant properties
}

export class MyCustomAuthenticator {
  // --- Static Properties --- Required

  // Choose a unique numeric ID for your auth method type (avoid standard Lit types)
  public static readonly AUTH_METHOD_TYPE_ID = 99999; // Example

  // Define the Lit Action code as a string
  public static readonly LIT_ACTION_CODE = `
    (async () => {
      // Your verification logic here...
      const { authMethodType, /* other params */ } = customAuthMethod;
      let isVerified = false;

      if (authMethodType === ${MyCustomAuthenticator.AUTH_METHOD_TYPE_ID}) {
          // --- VERIFICATION LOGIC --- 
          // This is the crucial part. See "Security Considerations" below.
          // Example 1: Call external server
          // const response = await Lit.Actions.fetch(apiUrl, { /* ... */ });
          // isVerified = response.ok;
          
          // Example 2: Verify backend signature
          // isVerified = await Lit.Actions.verifyJwt({ /* ... */ });
          // isVerified = await Lit.Actions.ethPersonalSignMessageEcdsa({ /* ... */ });
      }

      LitActions.setResponse({ response: isVerified ? "true" : "false" });
    })();
  `;

  // Automatically generate the base64 version
  public static readonly LIT_ACTION_CODE_BASE64 = Buffer.from(
    MyCustomAuthenticator.LIT_ACTION_CODE
  ).toString('base64');

  // Optional: If you pre-register the action code via IPFS
  // public static readonly LIT_ACTION_IPFS_ID = 'YOUR_IPFS_ID';

  // --- Instance Properties & Constructor --- Required
  // Store any settings needed for the instance (e.g., API URL)
  private myApiUrl: string;

  constructor(settings: MyAuthenticatorSettings) {
    // Initialize based on settings
    this.myApiUrl = settings.apiUrl;
  }

  // --- Authenticate Method --- Required
  // Performs the external auth flow and prepares jsParams for the Lit Action
  async authenticate(
    config: MyAuthConfig
  ): Promise<Record<string, any> | null> { // Must return jsParams or null
    try {
      // 1. Perform necessary external steps (e.g., call backend, handle redirect)
      //    using data from `config` (like credentials, oauthCode)
      const verificationResult = await this.performExternalAuth(config);

      // 2. If external auth is successful, prepare jsParams
      if (verificationResult.success) {
        const jsParams: MyJsParams = {
          customAuthMethod: {
            authMethodType: MyCustomAuthenticator.AUTH_METHOD_TYPE_ID,
            // Include data needed by the Lit Action for verification
            // Eg: verificationResult.userId, verificationResult.backendSignature, ...
          },
          publicKey: config.pkpPublicKey,
          sigName: config.sigName || 'my-custom-sig',
        };
        return jsParams;
      } else {
        console.error("External authentication failed");
        return null;
      }
    } catch (error) {
      console.error("Error during custom authentication:", error);
      return null;
    }
  }

  // --- Optional Helper Methods ---
  // Include methods specific to your flow (e.g., signIn, performExternalAuth)
  private async performExternalAuth(config: MyAuthConfig): Promise<{ success: boolean; /* ... result data ... */ }> {
     // Your logic here...
     return { success: true, /* ... */ };
  }
}
```

### 2. Implement Verification Logic in Lit Action

This is the most critical part for security.
The Lit Action code defined in `LIT_ACTION_CODE` **must** perform robust verification.

*   **Do NOT Trust Client Input:** Never blindly trust data passed directly from the client in `jsParams` as proof of authentication (e.g., just checking `if (userId)`).
*   **Verification Strategies:**
    *   **External API Call:** If you have a trusted backend server, the Lit Action should use `Lit.Actions.fetch` to call an endpoint on your server. Pass necessary identifiers (like username/password, session token) from `jsParams` to your server, have the server perform the validation, and return a simple success/fail response for the Lit Action to check. (See `ServerCustomAuthenticator.ts` example).
    *   **Backend Signature Verification:** Your backend verifies the user (e.g., via OAuth token), then creates a signed message (attestation) containing verified details (like `userId`, `pkpPublicKey`, `nonce`, `timestamp`). This signature is passed via `jsParams`. The Lit Action uses `Lit.Actions.verifyJwt`, `Lit.Actions.ethPersonalSignMessageEcdsa`, or another appropriate method to verify this signature using your backend's public key (which must be known to the Lit Action). This proves the backend vouches for the authentication. (See revised `GitHubCustomAuthenticator.ts` example).
    *   **Other Cryptographic Methods:** Depending on your system, other cryptographic verification methods might be applicable within the Lit Action.

### 3. Use with `AuthManager`

In your application code:

```typescript
import { MyCustomAuthenticator } from './MyCustomAuthenticator';
import * as LitAuth from '@lit-protocol/auth';
// ... other imports

async function authenticateUser() {
  const authManager = LitAuth.getAuthManager({ /* ... storage ... */ });
  const litClient = await getLitClient({ /* ... */ });

  const pkpPublicKey = "0x...";

  // Settings needed for your authenticator's constructor
  const mySettings = { apiUrl: '...' };

  // Config needed for your authenticator's authenticate method
  const myExecConfig = {
      pkpPublicKey,
      username: 'user',
      password: 'pass',
  };

  // SIWE / Session configuration
  const myAuthConfig: LitAuth.AuthConfig = { /* ... expiration, resources etc ... */ };

  try {
    const authContext = await authManager.getCustomAuthContext({
        authenticator: MyCustomAuthenticator, // Pass the class
        settings: mySettings,
        config: myExecConfig,
        authConfig: myAuthConfig,
        litClient: litClient,
    });

    console.log("Successfully obtained custom auth context:", authContext);
    // Use authContext with litClient.pkpSign etc.

  } catch (error) {
    console.error("Failed to get custom auth context:", error);
  }
}
```

## Security Considerations

*   **Lit Action is Key:** The security of your custom authentication method relies heavily on the verification logic within your Lit Action code. Ensure it cannot be easily bypassed.
*   **Backend Verification:** For most flows (especially OAuth or complex session management), leveraging your own trusted backend server to perform the primary verification and provide a signed attestation for the Lit Action to check is the recommended secure pattern.
*   **Avoid Sensitive Data in `jsParams`:** Do not pass highly sensitive data directly in `jsParams` if it can be avoided. If passing credentials (like the simple server example), ensure your backend endpoint is secure (HTTPS) and be aware of the implications.
*   **Nonce/Timestamp:** Include nonces or timestamps in signed messages verified by the Lit Action to prevent replay attacks.

By following these steps and prioritizing secure verification within the Lit Action, you can effectively integrate diverse authentication systems with Lit Protocol.
