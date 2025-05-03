
// Define the structure of the JS params the Lit Action expects
interface GitHubJsParams {
  customAuthMethod: {
    authMethodType: number; // Developer chooses a unique type ID
    githubUserId: string; // The verified GitHub user ID
    // Potentially add a nonce or timestamp verified by the client's backend
    // Or even better: a signature from the app's backend confirming verification
  };
  // Other params the action might need
  publicKey: string;
  sigName: string;
}

// --- Developer-Implemented Custom Authenticator Helper ---
// This class helps manage the GitHub OAuth flow and prepares the data needed
// for the Lit SDK's getCustomAuthContext method.
export class GitHubCustomAuthenticator {
  private clientId: string;
  private clientSecret: string; // **IMPORTANT: Should be kept server-side in real apps!**
  private redirectUri: string;

  // --- Static Constants ---
  // Chosen by the developer, must be unique within their app context
  public static readonly AUTH_METHOD_TYPE_ID = 90001;
  public static readonly LIT_ACTION_CODE = `
    (async () => {
      // Access the parameters passed from the client via jsParams
      const githubUserId = customAuthMethod.githubUserId;
      const expectedAuthType = customAuthMethod.authMethodType;

      // **VERY BASIC VERIFICATION (DEMO ONLY - NOT SECURE FOR PRODUCTION)**
      // A real action should verify a signature from the app's backend
      // or check a nonce/timestamp against node time if provided securely.
      let isVerified = false;
      if (expectedAuthType === ${GitHubCustomAuthenticator.AUTH_METHOD_TYPE_ID} && typeof githubUserId === 'string' && githubUserId.length > 0) {
         console.log("[Lit Action] GitHub User ID received:", githubUserId);
         // Simple check for demo purposes
         isVerified = true;
         // Add more robust checks here in a real application!
         // Eg: await Lit.Actions.ethPersonalSignMessageEcdsa({ message: nonce, publicKey: appBackendPublicKey, sig: backendSignature })
      }

      if (isVerified) {
        console.log("[Lit Action] GitHub custom auth verified successfully.");
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
  // Optional: If you pre-register the code as an IPFS ID
  // public static readonly LIT_ACTION_IPFS_ID = 'YOUR_IPFS_ID_HERE';

  constructor(config: {
    clientId: string;
    clientSecret: string; // Again, keep server-side!
    redirectUri: string;
  }) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
  }

  // --- Client-Side OAuth Initiation ---
  signIn() {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=read:user`;
    window.location.href = authUrl;
  }

  // --- Client-Side Handling of OAuth Callback & Param Preparation ---
  async handleRedirectAndPrepareJsParams(
    pkpPublicKey: string,
    sigName: string = 'github-custom-auth-sig'
  ): Promise<GitHubJsParams | null> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (!code) {
      console.error('No OAuth code found in redirect URL.');
      return null;
    }

    // **SECURITY NOTE:** In a real app, exchange the code for an access token
    // and fetch the user profile **on your backend server**, not the client!
    // The backend would then securely provide the verified githubUserId back to the client.
    // Simulating client-side flow for simplicity.

    try {
      // 1. Exchange code for access token (Simulated - replace with backend call)
      const MOCK_ACCESS_TOKEN = await this.exchangeCodeForToken(code);

      // 2. Fetch GitHub user ID using the access token (Simulated - replace with backend call)
      const MOCK_GITHUB_USER_ID = await this.fetchUserId(MOCK_ACCESS_TOKEN);

      // 3. Prepare jsParams for the Lit Action
      const jsParams: GitHubJsParams = {
        customAuthMethod: {
          authMethodType: GitHubCustomAuthenticator.AUTH_METHOD_TYPE_ID,
          githubUserId: MOCK_GITHUB_USER_ID,
        },
        publicKey: pkpPublicKey,
        sigName: sigName,
      };

      return jsParams;
    } catch (error) {
      console.error('Error handling GitHub redirect:', error);
      return null;
    }
  }

  // --- Helper methods (Simulated - Replace with real backend calls) ---
  private async exchangeCodeForToken(code: string): Promise<string> {
    console.log('Simulating exchange code for token with:', code);
    // Replace with actual fetch to your backend which talks to GitHub
    // await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return `gho_mock_token_for_code_${code.substring(0, 5)}`;
  }

  private async fetchUserId(token: string): Promise<string> {
    console.log('Simulating fetch user ID with token:', token);
    // Replace with actual fetch to your backend which talks to GitHub API
    // await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return `mock_github_user_${token.slice(-5)}`;
  }
}
