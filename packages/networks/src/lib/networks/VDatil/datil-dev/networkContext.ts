// this will cause error on the browser, it's just a stub for now
import { env } from 'config/env';
import { datilDevSignatures } from '@lit-protocol/contracts';
import { chronicleYellowstone } from '../../shared/chains/yellowstone.ts';
import { NetworkContext } from '../../shared/types';

export const datilDevNetworkContext: NetworkContext<
  // typeof datilDev,
  typeof datilDevSignatures
> = {
  network: 'datil-dev',
  rpcUrl: env.LIT_TXSENDER_RPC_URL,
  privateKey: env.LIT_TXSENDER_PRIVATE_KEY,
  chainConfig: {
    chain: chronicleYellowstone,
    contractData: datilDevSignatures,
  },
  httpProtocol: 'https://',
};

export type DatilDevNetworkContext = typeof datilDevNetworkContext;

// network object calls the chain client
// LitClient could use the network to figure out
