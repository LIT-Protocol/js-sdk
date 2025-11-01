import {
  Chain,
  DecryptRequest,
  DecryptResponse,
  EncryptResponse,
  EncryptSdkParams,
} from '@lit-protocol/types';
import { ChainConfig } from 'viem';

/**
 * Base interface shared by all Lit clients
 */
export interface BaseLitClient<T> {
  networkName: string;
  encrypt: (params: EncryptSdkParams) => Promise<EncryptResponse>;
  decrypt: (params: DecryptRequest) => Promise<DecryptResponse>;
  getContext: () => Promise<T>;
  getChainConfig: () => {
    viemConfig: ChainConfig;
    rpcUrl: string;
  };
  disconnect: () => void;
  getDefault: {
    authServiceUrl?: string;
    loginUrl: string;
  };
}
