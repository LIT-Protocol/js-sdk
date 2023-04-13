import { AppProps } from 'next/app';
import '../styles/globals.css';
import { WagmiConfig, createClient, configureChains, mainnet } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { Chain } from 'wagmi/chains';

const chronicleChain: Chain = {
  id: 175177,
  name: 'Chronicle',
  network: 'chronicle',
  // iconUrl: 'https://example.com/icon.svg',
  // iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'Chronicle - Lit Protocol Testnet',
    symbol: 'LIT',
  },
  rpcUrls: {
    default: {
      http: ['https://chain-rpc.litprotocol.com/http'],
    },
    public: {
      http: ['https://chain-rpc.litprotocol.com/http'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Chronicle - Lit Protocol Testnet',
      url: 'https://chain.litprotocol.com',
    },
  },
  testnet: true,
};

const { provider, chains } = configureChains(
  [chronicleChain],
  [
    jsonRpcProvider({
      rpc: chain => ({ http: chain.rpcUrls.default.http[0] }),
    }),
  ]
);

// const { chains, provider, webSocketProvider } = configureChains(
//   [mainnet],
//   [
//     alchemyProvider({ apiKey: 'onvoLvV97DDoLkAmdi0Cj7sxvfglKqDh' }),
//     publicProvider(),
//   ]
// );

const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'wagmi',
      },
    }),
    // new WalletConnectConnector({
    //   chains,
    //   options: {
    //     projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    //   },
    // }),
  ],
  provider,
  // webSocketProvider,
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={client}>
      <Component {...pageProps} />
    </WagmiConfig>
  );
}
