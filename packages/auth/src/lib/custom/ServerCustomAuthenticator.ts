import { ethers } from 'ethers';

// Define the structure of the JS params the Lit Action expects
// Now includes credentials and API URL for the action to use
interface ServerAuthJsParams {
  customAuthMethod: {
    authMethodType: number;
    username: string;
    // Password should ideally not be passed directly.
    // Better: Client gets a short-lived, single-use auth request token
    // from the server first, and passes that token here.
    // For simplicity of this example, we pass the password.
    password: string;
    apiUrl: string; // URL for the Lit Action to call
  };
  publicKey: string;
  sigName: string;
}

// Define constructor settings type (might just need apiUrl now)
interface ServerAuthenticatorSettings {
  apiUrl: string;
}

// Define execution config type for the authenticate method
// This now contains the raw credentials and pkpKey
interface ServerAuthConfig {
  pkpPublicKey: string;
  username: string;
  password: string;
  sigName?: string;
}

/**
 * ServerCustomAuthenticator - Example using the CORRECT pattern where the
 * Lit Action calls the external server for verification.
 */
export class ServerCustomAuthenticator {
  private apiUrl: string;

  // --- Static Constants (Required by ICustomAuthenticator) ---
  public static readonly AUTH_METHOD_TYPE_ID = 90002;
  public static readonly LIT_ACTION_CODE = `
    (async () => {
      // Access the parameters passed from the client via jsParams
      const { username, password, apiUrl, authMethodType } = customAuthMethod;

      // Basic validation of expected params
      if (authMethodType !== ${ServerCustomAuthenticator.AUTH_METHOD_TYPE_ID} || !username || !password || !apiUrl) {
        LitActions.setResponse({ response: "false", error: "Missing required jsParams" });
        return;
      }

      let isVerified = false;

      try {
        // Make the actual verification call to the external server
        console.log("[Lit Action] Calling verification server:", apiUrl);
        const response = await Lit.Actions.fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });

        if (response.ok) {
          // Check response body if server provides additional confirmation
          // const result = await response.json();
          // isVerified = result.success === true; // Example check
          console.log("[Lit Action] Server verification successful (Status: ", response.status, ")");
          isVerified = true; // Assume 2xx status means success for this example
        } else {
          console.error("[Lit Action] Server verification failed. Status:", response.status);
        }

      } catch (e) {
        console.error("[Lit Action] Error calling verification server:", e);
      }

      if (isVerified) {
        console.log("[Lit Action] Server custom auth verified successfully.");
        LitActions.setResponse({ response: "true" });
      } else {
        console.error("[Lit Action] Server custom auth verification failed.");
        LitActions.setResponse({ response: "false" });
      }
    })();
  `;

  public static readonly LIT_ACTION_CODE_BASE64 = Buffer.from(
    ServerCustomAuthenticator.LIT_ACTION_CODE
  ).toString('base64');

  // --- Constructor (Takes settings) ---
  constructor(settings: ServerAuthenticatorSettings) {
    this.apiUrl = settings.apiUrl;
  }

  // --- authenticate Method (Required by ICustomAuthenticatorInstance) ---
  // This method now just prepares the jsParams with credentials for the Lit Action.
  async authenticate(
    config: ServerAuthConfig
  ): Promise<Record<string, any> | null> {
    // Returns jsParams
    try {
      // Prepare jsParams with the credentials and API URL
      const jsParams: ServerAuthJsParams = {
        customAuthMethod: {
          authMethodType: ServerCustomAuthenticator.AUTH_METHOD_TYPE_ID,
          username: config.username,
          password: config.password, // Pass password (see security note above)
          apiUrl: this.apiUrl, // Pass the server URL for the Action
        },
        publicKey: config.pkpPublicKey,
        sigName: config.sigName || 'server-custom-auth-sig',
      };

      console.log('Prepared jsParams for ServerCustomAuthenticator:', jsParams);
      return jsParams; // Return prepared jsParams containing credentials
    } catch (error) {
      console.error('Error preparing jsParams for server auth:', error);
      return null;
    }
  }

  // Removed the client-side callAuthServer simulation
}
