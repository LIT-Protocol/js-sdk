import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/global.css";
import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { RouterProvider } from "react-router-dom";
import { mainnet } from "wagmi/chains";
import { createConfig } from "wagmi";
import { router } from "./router";

const queryClient = new QueryClient();

// Define the Chronicle Testnet (nagaDev)
const chronicleTestnet = {
  id: 175188,
  name: "Chronicle Testnet",
  nativeCurrency: { name: "Test Lit Token", symbol: "tLIT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://yellowstone-rpc.litprotocol.com"] },
    public: { http: ["https://yellowstone-rpc.litprotocol.com"] },
  },
  blockExplorers: {
    default: {
      name: "Chronicle Explorer",
      url: "https://chain.litprotocol.com",
    },
  },
  testnet: true,
};

const defaultConfig = createConfig({
  chains: [mainnet, chronicleTestnet],
  transports: {
    [mainnet.id]: http(),
    [chronicleTestnet.id]: http(),
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={defaultConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <RouterProvider router={router} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
