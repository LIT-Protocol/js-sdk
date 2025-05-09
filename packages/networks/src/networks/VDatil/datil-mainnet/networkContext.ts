import { datilSignatures } from '@lit-protocol/contracts';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import {
  anvilConfig,
  anvilFirstPrivateKey,
  anvilRpcUrl,
} from '../../../chains/Anvil';
import { INetworkContext } from '../common/NetworkContext';

export const datilMainnetNetworkContext: INetworkContext<
  typeof datilSignatures
> = {
  network: 'datil',
  rpcUrl: anvilRpcUrl,
  privateKey: anvilFirstPrivateKey,
  chainConfig: {
    chain: anvilConfig,
    contractData: datilSignatures,
  },
  httpProtocol: 'https://',
  walletClient: createWalletClient({
    chain: anvilConfig,
    transport: http(anvilRpcUrl),
    account: privateKeyToAccount(anvilFirstPrivateKey),
  }),
};

export type DatilMainnetNetworkContext = typeof datilMainnetNetworkContext;
