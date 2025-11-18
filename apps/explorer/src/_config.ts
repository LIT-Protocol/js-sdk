/**
 * Application Configuration
 *
 * This file centralizes all configurable settings for the application.
 * Modify these values to customize the application behavior.
 */

// WalletConnect Configuration
export const WALLET_CONNECT = {
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID", // Replace with your actual WalletConnect Project ID
};

// Application Information
export const APP_INFO = {
  copyright: "Lit Protocol",

  // Global service URLs (with defaults)
  litLoginServer:
    import.meta.env.VITE_LOGIN_SERVICE_URL || "https://login.litgateway.com",
  litAuthServer:
    import.meta.env.VITE_AUTH_SERVICE_URL || "https://auth-api.litprotocol.com",

  // Network-specific auth service URLs
  authServiceUrls: {
    "naga-dev":
      import.meta.env.VITE_AUTH_SERVICE_URL_NAGA_DEV ||
      "https://auth-api.litprotocol.com",
    "naga-test":
      import.meta.env.VITE_AUTH_SERVICE_URL_NAGA_TEST ||
      "https://auth-api.litprotocol.com",
    naga:
      import.meta.env.VITE_AUTH_SERVICE_URL_NAGA ||
      "https://auth-api.litprotocol.com",
  },

  litAuthServerApiKey: import.meta.env.VITE_AUTH_SERVICE_API_KEY,

  // Discord configuration
  discordClientId:
    import.meta.env.VITE_LOGIN_DISCORD_CLIENT_ID || "1052874239658692668",

  // Other URLs
  faucetUrl: "https://chronicle-yellowstone-faucet.getlit.dev/naga",
  defaultPrivateKey:
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  nagaLitActionsDocs: "https://naga.actions-docs.litprotocol.com",
} as const;

// Blockchain Network Configuration
export const NETWORKS = {
  chronicleYellowstone: {
    id: 175188,
    name: "Chronicle Yellowstone",
    network: "chronicle-yellowstone",
    iconUrl: "/logo.svg", // Add icon path here
    iconBackground: "#27233B",
  },
  enabled: [
    "Chronicle Yellowstone", // This must match the name above
    // "mainnet",
    // "sepolia",
    // "base",
    "arbitrum",
  ],
};

// Wallet Configuration
export const WALLETS = {
  recommended: ["rainbow", "metamask", "coinbase"],
  others: ["injected", "walletConnect"],
};

// Layout Configuration
export const LAYOUT = {
  maxWidth: "48rem", // max-w-3xl
  contentPadding: "24px",
};

// Application Features Toggle
export const FEATURES = {
  showWalletBalance: true,
  enableFlameAnimation: true,
};
