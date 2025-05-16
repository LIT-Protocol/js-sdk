import { LIT_ENDPOINT, HTTP, HTTPS } from '@lit-protocol/constants';
import { Chain } from 'viem';
/**
 * Configuration specific to the underlying blockchain of a Lit network.
 */
/**
 * Configuration for a specific Lit network.
 */
export interface LitNetworkConfig {
  networkName: string;
  httpProtocol: typeof HTTP | typeof HTTPS;
  endpoints: typeof LIT_ENDPOINT;
  rpcUrl: string;
  chainConfig: Chain;
  minNodeCount?: number;
}
export interface LitNetworkModuleBase {
  id: string;
  version: string;
  config: {
    requiredAttestation: boolean;
    abortTimeout: number;
    minimumThreshold: number;
  };
  getNetworkName: () => string;
  getHttpProtocol: () => typeof HTTP | typeof HTTPS;
  getEndpoints: () => typeof LIT_ENDPOINT;
  getRpcUrl: () => string;
  getChainConfig: () => Chain;
  createStateManager: () => Promise<any>;
}
