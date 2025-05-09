import { datilTestSignatures } from '@lit-protocol/contracts';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import {
  anvilConfig,
  anvilFirstPrivateKey,
  anvilRpcUrl,
} from '../../../chains/Anvil';
import { INetworkContext } from '../common/NetworkContext';

export const datilTestNetworkContext: INetworkContext<
  typeof datilTestSignatures
> = {
  network: 'datil-test',
  rpcUrl: anvilRpcUrl,
  privateKey: anvilFirstPrivateKey,
  chainConfig: {
    chain: anvilConfig,
    contractData: datilTestSignatures,
  },
  httpProtocol: 'https://',
  walletClient: createWalletClient({
    chain: anvilConfig,
    transport: http(anvilRpcUrl),
    account: privateKeyToAccount(anvilFirstPrivateKey),
  }),
};

export type DatilTestNetworkContext = typeof datilTestNetworkContext;
