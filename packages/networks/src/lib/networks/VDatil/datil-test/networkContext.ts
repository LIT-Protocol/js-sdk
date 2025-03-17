// this will cause error on the browser, it's just a stub for now
import { datilTestSignatures } from '@lit-protocol/contracts';
import { env } from '../../../../../../shared/config/env';
import { chronicleYellowstone } from '../../shared/chains/yellowstone.ts';
import { NetworkContext } from '../../shared/types';

export const datilTestNetworkContext: NetworkContext<
  typeof datilTestSignatures
> = {
  network: 'datil-test',
  rpcUrl: env.LIT_TXSENDER_RPC_URL,
  privateKey: env.LIT_TXSENDER_PRIVATE_KEY,
  chainConfig: {
    chain: chronicleYellowstone,
    contractData: datilTestSignatures,
  },
  httpProtocol: 'https://',
};

export type DatilTestNetworkContext = typeof datilTestNetworkContext;
