import { datilDevSignatures } from '@lit-protocol/contracts';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import {
  anvilConfig,
  anvilFirstPrivateKey,
  anvilRpcUrl,
} from '../../../chains/Anvil.js';
import { INetworkContext } from '../common/NetworkContext';

export const datilDevNetworkContext: INetworkContext<
  typeof datilDevSignatures
> = {
  network: 'datil-dev',
  rpcUrl: anvilRpcUrl,
  privateKey: anvilFirstPrivateKey,
  chainConfig: {
    chain: anvilConfig,
    contractData: datilDevSignatures,
  },
  httpProtocol: 'https://',
  walletClient: createWalletClient({
    chain: anvilConfig,
    transport: http(anvilRpcUrl),
    account: privateKeyToAccount(anvilFirstPrivateKey),
  }),
};

export type DatilDevNetworkContext = typeof datilDevNetworkContext;

// network object calls the chain client
// LitClient could use the network to figure out
