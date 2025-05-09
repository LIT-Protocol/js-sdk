import { Hex } from 'viem';
import * as anvil from '../../../../chains/Anvil';
import { INetworkConfig } from '../../interfaces/NetworkContext';

/**
 * This is locally generated signatures
 */
import { NAGA_ENDPOINT } from '../../shared/endpoints';
import { signatures } from './generated/naga-develop';

const NETWORK = 'custom';
const PROTOCOL = 'http://';
const MINIMUM_THRESHOLD = 3;
const REALM_ID = 1n;

interface NagaLocalDevSpecificConfigs {
  realmId?: bigint;
  privateKey?: Hex;
}

export const nagaLocalDevelopNetworkContext: INetworkConfig<
  typeof signatures,
  NagaLocalDevSpecificConfigs
> = {
  minimumThreshold: MINIMUM_THRESHOLD,
  network: NETWORK,
  rpcUrl: anvil.RPC_URL,
  abiSignatures: signatures,
  chainConfig: anvil.viemChainConfig,
  httpProtocol: PROTOCOL,
  networkSpecificConfigs: {
    realmId: REALM_ID,
    privateKey: anvil.DEV_PRIVATE_KEY,
  },
  endpoints: NAGA_ENDPOINT,
};

export type NagaLocalDevelopNetworkContext =
  typeof nagaLocalDevelopNetworkContext;

// network object calls the chain client
// LitClient could use the network to figure out
