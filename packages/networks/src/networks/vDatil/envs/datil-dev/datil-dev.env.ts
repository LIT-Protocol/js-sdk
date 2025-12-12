import { datilDevSignatures } from '@lit-protocol/contracts';
import { Chain } from 'viem';
import * as chainInfo from '../../../../chains/ChronicleYellowstone';
import { NAGA_ENDPOINT } from '../../../vNaga/shared/managers/endpoints-manager/endpoints';
import type { NagaEndpointsType } from '../../../vNaga/shared/managers/endpoints-manager/endpoints';
import { BaseNetworkEnvironment } from '../../../vNaga/envs/base/BaseNetworkEnvironment';

const NETWORK = 'datil-dev';
const PROTOCOL = 'https://';
const MINIMUM_THRESHOLD = 3;
const DEFAULT_REALM_ID = 1n;

export interface DatilDevSpecificConfigs {
  realmId?: bigint;
}

export type DatilDevSignatures = typeof datilDevSignatures;

export class DatilDevEnvironment extends BaseNetworkEnvironment<
  DatilDevSignatures,
  DatilDevSpecificConfigs
> {
  constructor(options?: { rpcUrlOverride?: string }) {
    super({
      network: NETWORK,
      abiSignatures: datilDevSignatures,
      networkSpecificConfigs: {
        realmId: DEFAULT_REALM_ID,
      },
      services: {
        loginServiceBaseUrl: 'https://login.litgateway.com',
      },
      minimumThreshold: MINIMUM_THRESHOLD,
      httpProtocol: PROTOCOL,
      requiredAttestation: false,
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
    // Placeholder: reuse Naga endpoints until Datil-specific endpoints are defined
    return NAGA_ENDPOINT;
  }

  protected getDefaultRealmId(): bigint {
    return DEFAULT_REALM_ID;
  }
}

export const datilDevEnvironment = new DatilDevEnvironment();
