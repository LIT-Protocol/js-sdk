import { Chain } from 'viem';

export const anvilRpcUrl = 'http://127.0.0.1:8545';
export const anvilFirstPrivateKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
export const anvilConfig: Chain = {
  id: 31337,
  name: 'Local Anvil',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [anvilRpcUrl],
      webSocket: [],
    },
    public: {
      http: [anvilRpcUrl],
      webSocket: [],
    },
  },
  blockExplorers: {
    default: {
      name: 'Anvil Explorer',
      url: anvilRpcUrl,
    },
  },
};
