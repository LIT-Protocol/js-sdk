import { nagaTestSignatures } from '@lit-protocol/contracts';
import * as chainInfo from '../../../../chains/ChronicleYellowstone';
import { NAGA_ENDPOINT } from '../../endpoints-manager/endpoints';
import { INetworkConfig } from '../../interfaces/NetworkContext';

const NETWORK = 'naga-test';
const PROTOCOL = 'https://';
const MINIMUM_THRESHOLD = 3;

/**
 * TODO: This is a temporary default realm id. There's are two abis functions called 'getAllReservedValidators' and 'numRealms' in the latest lit-assets branch. We need to call that to see how many realms there are. If there's only one realm, then we can use that as the default realm id. Otherwise, we will randomly choose one.
 */
const DEFAULT_REALM_ID = 1n;

export interface NagaTestSpecificConfigs {
  realmId?: bigint;
  // privateKey?: Hex;
}

export type NagaTestSignatures = typeof nagaTestSignatures;

export const networkConfig: INetworkConfig<
  NagaTestSignatures,
  NagaTestSpecificConfigs
> = {
  minimumThreshold: MINIMUM_THRESHOLD,
  network: NETWORK,
  rpcUrl: chainInfo.RPC_URL,
  abiSignatures: nagaTestSignatures,
  chainConfig: chainInfo.viemChainConfig,
  httpProtocol: PROTOCOL,
  networkSpecificConfigs: {
    realmId: DEFAULT_REALM_ID,
  },
  endpoints: NAGA_ENDPOINT,
  services: {
    authServiceBaseUrl: 'https://naga-test-auth-service.onrender.com',
    loginServiceBaseUrl: 'https://login.litgateway.com',
  },
};

export type NagaTestNetworkConfig = typeof networkConfig;

// network object calls the chain client
// LitClient could use the network to figure out
