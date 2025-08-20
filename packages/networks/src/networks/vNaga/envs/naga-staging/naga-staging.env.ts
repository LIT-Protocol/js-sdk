import { nagaStagingSignatures } from '@lit-protocol/contracts';
import { Chain } from 'viem';
import * as chainInfo from '../../../../chains/ChronicleYellowstone';
import { NAGA_ENDPOINT } from '../../shared/managers/endpoints-manager/endpoints';
import type { NagaEndpointsType } from '../../shared/managers/endpoints-manager/endpoints';
import { BaseNetworkEnvironment } from '../base/BaseNetworkEnvironment';

const NETWORK = 'naga-staging';
const PROTOCOL = 'https://';
const MINIMUM_THRESHOLD = 3;
const DEFAULT_REALM_ID = 1n;

export interface NagaStagingSpecificConfigs {
  realmId?: bigint;
}

export type NagaStagingSignatures = typeof nagaStagingSignatures;

export class NagaStagingEnvironment extends BaseNetworkEnvironment<
  NagaStagingSignatures,
  NagaStagingSpecificConfigs
> {
  constructor() {
    super({
      network: NETWORK,
      abiSignatures: nagaStagingSignatures,
      networkSpecificConfigs: {
        realmId: DEFAULT_REALM_ID,
      },
      services: {
        authServiceBaseUrl: 'https://naga-auth-service.getlit.dev',
        loginServiceBaseUrl: 'https://login.litgateway.com',
      },
      minimumThreshold: MINIMUM_THRESHOLD,
      httpProtocol: PROTOCOL,
      requiredAttestation: true,
    });
  }

  protected getRpcUrl(): string {
    return chainInfo.RPC_URL;
  }

  protected getChainConfig(): Chain {
    return chainInfo.viemChainConfig;
  }

  protected getEndpoints(): NagaEndpointsType {
    return NAGA_ENDPOINT;
  }

  protected getDefaultRealmId(): bigint {
    return DEFAULT_REALM_ID;
  }
}

// Create singleton instance
export const nagaStagingEnvironment = new NagaStagingEnvironment();

// Export the config for backward compatibility
export const networkConfig = nagaStagingEnvironment.getConfig();
export type NagaStagingNetworkConfig = typeof networkConfig;
