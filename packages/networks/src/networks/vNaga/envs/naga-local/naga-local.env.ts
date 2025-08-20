import { Chain, Hex } from 'viem';
import * as chainInfo from '../../../../chains/Anvil';
import { NAGA_ENDPOINT } from '../../shared/managers/endpoints-manager/endpoints';
import type { NagaEndpointsType } from '../../shared/managers/endpoints-manager/endpoints';
import { BaseNetworkEnvironment } from '../base/BaseNetworkEnvironment';
import { signatures } from './generated/naga-develop';

const NETWORK = 'custom';
const PROTOCOL = 'http://'; // Note: Different from dev/staging
const MINIMUM_THRESHOLD = 3;
const DEFAULT_REALM_ID = 1n;

export interface NagaLocalSpecificConfigs {
  realmId?: bigint;
  privateKey?: Hex; // Note: Local has private key config
}

export type NagaLocalSignatures = typeof signatures;

export class NagaLocalEnvironment extends BaseNetworkEnvironment<
  NagaLocalSignatures,
  NagaLocalSpecificConfigs
> {
  constructor() {
    super({
      network: NETWORK,
      abiSignatures: signatures, // Note: Uses locally generated signatures
      networkSpecificConfigs: {
        realmId: DEFAULT_REALM_ID,
        privateKey: chainInfo.DEV_PRIVATE_KEY, // Note: Includes private key
      },
      services: {
        authServiceBaseUrl: 'https://naga-auth-service.getlit.dev',
        loginServiceBaseUrl: 'http://localhost:3300',
      },
      minimumThreshold: MINIMUM_THRESHOLD,
      httpProtocol: PROTOCOL, // Note: HTTP not HTTPS
      requiredAttestation: false,
    });
  }

  protected getRpcUrl(): string {
    return chainInfo.RPC_URL; // Note: Uses Anvil instead of ChronicleYellowstone
  }

  protected getChainConfig(): Chain {
    return chainInfo.viemChainConfig; // Note: Anvil chain config
  }

  protected getEndpoints(): NagaEndpointsType {
    return NAGA_ENDPOINT;
  }

  protected getDefaultRealmId(): bigint {
    return DEFAULT_REALM_ID;
  }

  // Additional getter for the private key (specific to local environment)
  public getPrivateKey(): Hex | undefined {
    return this.config.networkSpecificConfigs?.privateKey;
  }
}

// Create singleton instance
export const nagaLocalEnvironment = new NagaLocalEnvironment();
