import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import {
  anvilConfig,
  anvilFirstPrivateKey,
  anvilRpcUrl,
} from '../../shared/chains/anvil';
import { INetworkContext } from '../common/NetworkContext';
import { signatures as localDevelopSignatures } from './naga-develop-signatures/naga-develop';

export const nagaLocalDevelopNetworkContext: INetworkContext<
  typeof localDevelopSignatures
> = {
  network: 'custom',
  rpcUrl: anvilRpcUrl,
  privateKey: anvilFirstPrivateKey,
  chainConfig: {
    chain: anvilConfig,
    contractData: localDevelopSignatures,
  },
  httpProtocol: 'http://',
  walletClient: createWalletClient({
    chain: anvilConfig,
    transport: http(anvilRpcUrl),
    account: privateKeyToAccount(anvilFirstPrivateKey),
  }),
  realmId: 1n,
};

export type NagaLocalDevelopNetworkContext =
  typeof nagaLocalDevelopNetworkContext;

// network object calls the chain client
// LitClient could use the network to figure out
