import { nagaProtoSignatures } from '@lit-protocol/contracts';
import { Chain } from 'viem';
import * as chainInfo from '../../../../chains/LitChain';
import { NAGA_ENDPOINT } from '../../shared/managers/endpoints-manager/endpoints';
import type { NagaEndpointsType } from '../../shared/managers/endpoints-manager/endpoints';
import { BaseNetworkEnvironment } from '../base/BaseNetworkEnvironment';

const NETWORK = 'naga-proto';
const PROTOCOL = 'https://';
const MINIMUM_THRESHOLD = 3;
const DEFAULT_REALM_ID = 1n;

export interface NagaProtoSpecificConfigs {
  realmId?: bigint;
}

export type NagaProtoSignatures = typeof nagaProtoSignatures;

export class NagaProtoEnvironment extends BaseNetworkEnvironment<
  NagaProtoSignatures,
  NagaProtoSpecificConfigs
> {
  constructor(options?: { rpcUrlOverride?: string }) {
    super({
      network: NETWORK,
      abiSignatures: nagaProtoSignatures,
      networkSpecificConfigs: {
        realmId: DEFAULT_REALM_ID,
      },
      services: {
        loginServiceBaseUrl: '', // production/proto uses self-hosted login
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
export const nagaProtoEnvironment = new NagaProtoEnvironment();
