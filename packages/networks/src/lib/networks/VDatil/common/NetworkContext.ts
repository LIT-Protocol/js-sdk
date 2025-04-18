import { Chain, WalletClient } from 'viem';

const HTTP = 'http://' as const;
const HTTPS = 'https://' as const;

// Datil Network Context
export interface INetworkContext<T> {
  network: string;
  rpcUrl: string;
  privateKey: string;
  chainConfig: {
    chain: Chain;
    contractData: T;
  };
  httpProtocol: typeof HTTP | typeof HTTPS;
  walletClient: WalletClient;
}
