import { Hex } from 'viem';
import * as chainInfo from '../../../../chains/Anvil';
import { INetworkConfig } from '../../interfaces/NetworkContext';

/**
 * This is locally generated signatures
 */
import { NAGA_ENDPOINT } from '../../endpoints-manager/endpoints';
import { signatures } from './generated/naga-develop';

const NETWORK = 'custom';
const PROTOCOL = 'http://';
const MINIMUM_THRESHOLD = 3;
const REALM_ID = 1n;

interface NagaLocalDevSpecificConfigs {
  realmId?: bigint;
  privateKey?: Hex;
}

export type NagaLocalSignatures = typeof signatures;

export const networkConfig: INetworkConfig<
  NagaLocalSignatures,
  NagaLocalDevSpecificConfigs
> = {
  minimumThreshold: MINIMUM_THRESHOLD,
  network: NETWORK,
  rpcUrl: chainInfo.RPC_URL,
  abiSignatures: signatures,
  chainConfig: chainInfo.viemChainConfig,
  httpProtocol: PROTOCOL,
  networkSpecificConfigs: {
    realmId: REALM_ID,
    privateKey: chainInfo.DEV_PRIVATE_KEY,
  },
  endpoints: NAGA_ENDPOINT,
  services: {
    authServiceBaseUrl: 'http://localhost:3301',
    loginServiceBaseUrl: 'http://localhost:3300',
  },
};

export type NagaLocalNetworkContext = typeof networkConfig;

// network object calls the chain client
// LitClient could use the network to figure out