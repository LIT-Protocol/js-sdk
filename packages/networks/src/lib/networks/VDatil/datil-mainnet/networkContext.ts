// this will cause error on the browser, it's just a stub for now
import { datilSignatures } from '@lit-protocol/contracts';
import { env } from 'config/env';
import { chronicleYellowstone } from '../../shared/chains/yellowstone.ts';
import { NetworkContext } from '../../shared/types';

export const datilMainnetNetworkContext: NetworkContext<
  typeof datilSignatures
> = {
  network: 'datil',
  rpcUrl: env.LIT_TXSENDER_RPC_URL,
  privateKey: env.LIT_TXSENDER_PRIVATE_KEY,
  chainConfig: {
    chain: chronicleYellowstone,
    contractData: datilSignatures,
  },
  httpProtocol: 'https://',
};

export type DatilMainnetNetworkContext = typeof datilMainnetNetworkContext;
