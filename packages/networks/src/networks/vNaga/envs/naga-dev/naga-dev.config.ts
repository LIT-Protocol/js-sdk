import { nagaDevSignatures } from '@lit-protocol/contracts';
import { Hex } from 'viem';
import * as anvil from '../../../../chains/Anvil';
import { INetworkConfig } from '../../interfaces/NetworkContext';
import { NAGA_ENDPOINT } from '../../shared/endpoints';

const NETWORK = 'naga-dev';
const PROTOCOL = 'https://';
const MINIMUM_THRESHOLD = 3;

/**
 * TODO: This is a temporary default realm id. There's are two abis functions called 'getAllReservedValidators' and 'numRealms' in the latest lit-assets branch. We need to call that to see how many realms there are. If there's only one realm, then we can use that as the default realm id. Otherwise, we will randomly choose one.
 */
const DEFAULT_REALM_ID = 1n;

export interface NagaDevSpecificConfigs {
  realmId?: bigint;
  privateKey?: Hex;
}

export const nagaDevNetworkConfig: INetworkConfig<
  typeof nagaDevSignatures,
  NagaDevSpecificConfigs
> = {
  minimumThreshold: MINIMUM_THRESHOLD,
  network: NETWORK,
  rpcUrl: anvil.RPC_URL,
  abiSignatures: nagaDevSignatures,
  chainConfig: anvil.viemChainConfig,
  httpProtocol: PROTOCOL,
  networkSpecificConfigs: {
    realmId: DEFAULT_REALM_ID,
  },
  endpoints: NAGA_ENDPOINT,
};

export type NagaDevNetworkConfig = typeof nagaDevNetworkConfig;

// network object calls the chain client
// LitClient could use the network to figure out
