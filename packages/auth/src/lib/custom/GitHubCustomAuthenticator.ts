// Define the structure of the JS params the Lit Action expects
interface GitHubJsParams {
  customAuthMethod: {
    authMethodType: number; // Developer chooses a unique type ID
    githubUserId: string; // The verified GitHub user ID (verified by backend)
    // Signature from the application backend attesting to the GitHub verification
    backendSignature: string;
    // Optional: Include nonce/timestamp in the signed message for replay protection
    signedMessage: string; // e.g., `githubUserId:pkpPublicKey:nonce:timestamp`
  };
  // Other params the action might need
  publicKey: string; // Target PKP Public Key
  sigName: string;
}

// Define constructor settings type
interface GitHubAuthenticatorSettings {
  clientId: string;
  // Client secret is NOT needed here if backend handles token exchange
  redirectUri: string;
  // URL of the application backend endpoint that verifies GitHub token
  // and returns the signed attestation
  backendVerifyUrl: string;
}

// Define execution config type for the authenticate method
interface GitHubAuthConfig {
  pkpPublicKey: string;
  sigName?: string;
  // OAuth code obtained from GitHub redirect
  oauthCode: string;
}

// --- Developer-Implemented Custom Authenticator Helper ---
// This class helps manage the GitHub OAuth flow and prepares the data needed
// for the Lit SDK's getCustomAuthContext method.
export class GitHubCustomAuthenticator {
  private redirectUri: string;
  private backendVerifyUrl: string;

  // --- Static Constants (Required by ICustomAuthenticator) ---
  public static readonly AUTH_METHOD_TYPE_ID = 90001; // Example type ID
  public static readonly LIT_ACTION_CODE = `
    (async () => {
      // Access the parameters passed from the client via jsParams
      const { githubUserId, backendSignature, signedMessage, authMethodType } = customAuthMethod;
      const pkpPublicKey = publicKey; // PKP this auth is intended for

      // **CONFIGURABLE: Backend's Public Key for Verification**
      // This public key MUST be known by the Lit Action to verify the backend signature.
      // It could be hardcoded, passed via jsParams (less secure), or fetched securely.
      const APP_BACKEND_PUBLIC_KEY = "0x..."; // REPLACE WITH YOUR BACKEND'S PUBLIC KEY

      // Basic validation of expected params
      if (authMethodType !== ${GitHubCustomAuthenticator.AUTH_METHOD_TYPE_ID} || !githubUserId || !backendSignature || !signedMessage || !APP_BACKEND_PUBLIC_KEY || APP_BACKEND_PUBLIC_KEY === "0x...") {
        LitActions.setResponse({ response: "false", error: "Missing required jsParams or backend public key not configured" });
        return;
      }

      let isVerified = false;

      try {
        // Verify the signature from the application backend
        // Ensure the signed message includes expected data (userId, pkpPublicKey, nonce/timestamp)
        // to prevent misuse or replay attacks.
        console.log("[Lit Action] Verifying backend signature...");
        // Example using ethPersonalSignMessageEcdsa (adjust if backend uses a different method)
        isVerified = await Lit.Actions.ethPersonalSignMessageEcdsa({
            message: signedMessage,
            publicKey: APP_BACKEND_PUBLIC_KEY,
            signature: backendSignature
        });

        if (!isVerified) {
           console.error("[Lit Action] Backend signature verification failed.");
        }
        // Optional: Check if pkpPublicKey in signedMessage matches the current execution context
        // (Depends on how you structure signedMessage)

      } catch (e) {
        console.error("[Lit Action] Error verifying backend signature:", e);
      }

      if (isVerified) {
        console.log("[Lit Action] GitHub custom auth verified successfully via backend signature.");
        LitActions.setResponse({ response: "true" });
      } else {
        console.error("[Lit Action] GitHub custom auth verification failed.");
        LitActions.setResponse({ response: "false" });
      }
    })();
  `;
  public static readonly LIT_ACTION_CODE_BASE64 = Buffer.from(
    GitHubCustomAuthenticator.LIT_ACTION_CODE
  ).toString('base64');
  // public static readonly LIT_ACTION_IPFS_ID = 'YOUR_IPFS_ID_HERE';

  // --- Constructor (Takes settings) ---
  constructor(settings: GitHubAuthenticatorSettings) {
    // Note: No clientSecret needed here if backend handles token exchange
    this.redirectUri = settings.redirectUri;
    this.backendVerifyUrl = settings.backendVerifyUrl;
  }

  // --- authenticate Method (Required by ICustomAuthenticatorInstance) ---
  // This method now calls the application backend to verify the GitHub OAuth code
  // and receives a signed attestation back.
  async authenticate(
    config: GitHubAuthConfig
  ): Promise<Record<string, any> | null> {
    // Returns jsParams

    // **SECURITY NOTE:** The backend MUST securely verify the OAuth code with GitHub.

    try {
      console.log(
        'Calling backend to verify GitHub code and get attestation...'
      );
      // 1. Call the application backend, passing the OAuth code and target PKP Public Key
      const backendResponse = await fetch(this.backendVerifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: config.oauthCode,
          pkpPublicKey: config.pkpPublicKey,
        }),
      });

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        throw new Error(
          `Backend verification failed: ${backendResponse.status} ${errorText}`
        );
      }

      const attestation = await backendResponse.json();
      // Expecting attestation like: { userId: "...". signature: "0x...", signedMessage: "..." }

      if (
        !attestation.userId ||
        !attestation.signature ||
        !attestation.signedMessage
      ) {
        throw new Error('Invalid attestation received from backend');
      }

      // 2. Prepare jsParams using data from the backend attestation and input config
      const jsParams: GitHubJsParams = {
        customAuthMethod: {
          authMethodType: GitHubCustomAuthenticator.AUTH_METHOD_TYPE_ID,
          githubUserId: attestation.userId, // Use ID verified by backend
          backendSignature: attestation.signature, // Pass backend signature
          signedMessage: attestation.signedMessage, // Pass signed message
        },
        publicKey: config.pkpPublicKey, // Pass target PKP key
        sigName: config.sigName || 'github-custom-auth-sig', // Pass sigName
      };

      console.log('Prepared jsParams with backend attestation:', jsParams);
      return jsParams; // Return the prepared jsParams
    } catch (error) {
      console.error('Error during backend GitHub verification call:', error);
      return null;
    }
  }

  // --- Client-Side OAuth Initiation (Helper, not part of ICustomAuthenticator) ---
  // Constructor now only needs clientId for this helper
  signIn(clientId: string) {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${this.redirectUri}&scope=read:user`;
    window.location.href = authUrl;
  }

  // Removed client-side token exchange/user fetch simulation
}
