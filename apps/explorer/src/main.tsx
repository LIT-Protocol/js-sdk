import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";

import { litChainViemConfig } from "@/domain/lit/litChainConfig";

import { router } from "./router";
import "./styles/global.css";

const PUBLIC_ENV_VARS = {
  VITE_LOGIN_SERVICE_URL: import.meta.env.VITE_LOGIN_SERVICE_URL,
  VITE_LOGIN_DISCORD_CLIENT_ID: import.meta.env.VITE_LOGIN_DISCORD_CLIENT_ID,
  VITE_AUTH_SERVICE_URL: import.meta.env.VITE_AUTH_SERVICE_URL,
  VITE_AUTH_SERVICE_URL_NAGA_DEV: import.meta.env.VITE_AUTH_SERVICE_URL_NAGA_DEV,
  VITE_AUTH_SERVICE_URL_NAGA_TEST:
    import.meta.env.VITE_AUTH_SERVICE_URL_NAGA_TEST,
  VITE_AUTH_SERVICE_URL_NAGA_PROTO:
    import.meta.env.VITE_AUTH_SERVICE_URL_NAGA_PROTO,
  VITE_AUTH_SERVICE_URL_NAGA: import.meta.env.VITE_AUTH_SERVICE_URL_NAGA,
  VITE_AUTH_SERVICE_API_KEY: import.meta.env.VITE_AUTH_SERVICE_API_KEY,
  VITE_LIT_CHAIN_RPC_URL: import.meta.env.VITE_LIT_CHAIN_RPC_URL,
  VITE_LIT_CHAIN_EXPLORER_URL: import.meta.env.VITE_LIT_CHAIN_EXPLORER_URL,
  VITE_LIT_CHAIN_EXPLORER_NAME: import.meta.env.VITE_LIT_CHAIN_EXPLORER_NAME,
  VITE_LIT_YELLOWSTONE_RPC_URL:
    import.meta.env.VITE_LIT_YELLOWSTONE_RPC_URL,
  VITE_LIT_YELLOWSTONE_EXPLORER_URL:
    import.meta.env.VITE_LIT_YELLOWSTONE_EXPLORER_URL,
};

console.info("[naga-explorer] Public env vars", PUBLIC_ENV_VARS);

const queryClient = new QueryClient();

const CHRONICLE_RPC_URL =
  import.meta.env.VITE_LIT_YELLOWSTONE_RPC_URL ||
  "https://yellowstone-rpc.litprotocol.com/";
const CHRONICLE_EXPLORER_URL =
  import.meta.env.VITE_LIT_YELLOWSTONE_EXPLORER_URL ||
  "https://yellowstone-explorer.litprotocol.com/";

// Define the Chronicle Testnet (naga-dev & naga-test)
const chronicleTestnet = {
  id: 175188,
  name: "Chronicle Yellowstone",
  network: "chronicle-yellowstone",
  nativeCurrency: { name: "Chronicle Yellowstone", symbol: "tstLPX", decimals: 18 },
  rpcUrls: {
    default: { http: [CHRONICLE_RPC_URL] },
    public: { http: [CHRONICLE_RPC_URL] },
  },
  blockExplorers: {
    default: {
      name: "Chronicle Explorer",
      url: CHRONICLE_EXPLORER_URL,
    },
  },
  testnet: true,
} as const;

const defaultConfig = createConfig({
  chains: [mainnet, chronicleTestnet, litChainViemConfig],
  transports: {
    [mainnet.id]: http(),
    [chronicleTestnet.id]: http(
      chronicleTestnet.rpcUrls.default.http[0] ?? CHRONICLE_RPC_URL
    ),
    [litChainViemConfig.id]: http(
      litChainViemConfig.rpcUrls.default.http[0] ??
        litChainViemConfig.rpcUrls.public.http[0] ??
        CHRONICLE_RPC_URL
    ),
  },
});

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root not found");
}

createRoot(rootEl).render(
  <StrictMode>
    <WagmiProvider config={defaultConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <RouterProvider router={router} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
