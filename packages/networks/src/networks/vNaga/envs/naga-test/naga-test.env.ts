import { nagaTestSignatures } from '@lit-protocol/contracts';
import { Chain } from 'viem';
import * as chainInfo from '../../../../chains/ChronicleYellowstone';
import { NAGA_ENDPOINT } from '../../shared/managers/endpoints-manager/endpoints';
import type { NagaEndpointsType } from '../../shared/managers/endpoints-manager/endpoints';
import { BaseNetworkEnvironment } from '../base/BaseNetworkEnvironment';

const NETWORK = 'naga-test';
const PROTOCOL = 'https://';
const MINIMUM_THRESHOLD = 3;
const DEFAULT_REALM_ID = 1n;

export interface NagaTestSpecificConfigs {
  realmId?: bigint;
}

export type NagaTestSignatures = typeof nagaTestSignatures;

export class NagaTestEnvironment extends BaseNetworkEnvironment<
  NagaTestSignatures,
  NagaTestSpecificConfigs
> {
  constructor(options?: { rpcUrlOverride?: string }) {
    super({
      network: NETWORK,
      abiSignatures: nagaTestSignatures,
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
      rpcUrlOverride: options?.rpcUrlOverride,
    });
  }

  protected getRpcUrl(overrideRpc?: string): string {
    return chainInfo.resolveRpcUrl(overrideRpc);
  }

  protected getChainConfig(overrideRpc?: string): Chain {
    return chainInfo.buildViemChainConfig(overrideRpc);
  }

  protected getEndpoints(): NagaEndpointsType {
    return NAGA_ENDPOINT;
  }

  protected getDefaultRealmId(): bigint {
    return DEFAULT_REALM_ID;
  }
}

// Create singleton instance
export const nagaTestEnvironment = new NagaTestEnvironment();
