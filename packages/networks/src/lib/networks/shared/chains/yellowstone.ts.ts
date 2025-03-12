import { Chain, http } from "viem";
import { createConfig } from "wagmi";

export const chronicleYellowstone: Chain = {
  id: 175188,
  name: "Chronicle Yellowstone - Lit Protocol Testnet",
  nativeCurrency: {
    name: "Test LPX",
    symbol: "tstLPX",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://yellowstone-rpc.litprotocol.com/"],
      webSocket: [],
    },
    public: {
      http: ["https://yellowstone-rpc.litprotocol.com/"],
      webSocket: [],
    },
  },
  blockExplorers: {
    default: {
      name: "Yellowstone Explorer",
      url: "https://yellowstone-explorer.litprotocol.com/",
    },
  },
};

/**
 * Here's how your use it:
 * <WagmiProvider config={config}>
 *   <ExampleComponent />
 * </WagmiProvider>
 *
 * import React, { useEffect } from "react";
 * import { usePublicClient, useWalletClient } from "wagmi";
 * import { createLitContracts } from "../createLitContracts";
 *
 * export function ExampleComponent() {
 *   const publicClient = usePublicClient();
 *   const { data: walletClient } = useWalletClient();
 *
 *   useEffect(() => {
 *     if (publicClient && walletClient) {
 *       // Pass wagmi's clients into your Lit function
 *       const { pkpNftContract, pkpHelperContract } = createLitContracts(
 *         "datil-dev",
 *         {
 *           publicClient,
 *           walletClient,
 *         }
 *       );
 *
 *       // Now you can do contract reads/writes with the user's wallet
 *       (async () => {
 *         const cost = await pkpNftContract.read.mintCost();
 *         console.log("mintCost =", cost);
 *       })();
 *     }
 *   }, [publicClient, walletClient]);
 *
 *   return <div>My wagmi + Lit example</div>;
 * }
 */
export const WagmiConfig = createConfig({
  chains: [chronicleYellowstone],
  transports: {
    [chronicleYellowstone.id]: http(),
  },
});
