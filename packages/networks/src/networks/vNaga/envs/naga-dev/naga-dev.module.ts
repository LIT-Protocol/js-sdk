import { HTTP, HTTPS, LIT_NETWORK } from '@lit-protocol/constants';
import { ethers } from 'ethers';
import type { LitNetworkModule } from '../../../LitNetworkModule';
import { networkConfig } from './naga-dev.config';
import type { LitContractContext, EpochInfo } from '@lit-protocol/types';
import { createStateManager } from '@nagaDev/StateManager';
import { privateKeyToAccount } from 'viem/accounts';
import { createReadOnlyChainManager } from '@nagaDev/ChainManager';
import { LitNagaNetworkModule } from '../../LitNagaNetworkModule';

export const nagaDevModule: LitNagaNetworkModule = {
  id: 'naga',
  getNetworkName: () => networkConfig.network,
  getHttpProtocol: () => networkConfig.httpProtocol,
  getEndpoints: () => networkConfig.endpoints,
  getRpcUrl: () => networkConfig.rpcUrl,
  getChainConfig: () => networkConfig.chainConfig,
  // getConnectionInfo now uses the NagaChainClient for on-chain data
  getConnectionInfo: async () => {
    const readOnlyChainManager = createReadOnlyChainManager();

    // Explicitly type 'connection' with the awaited return type of the SDK's getConnectionInfo
    const connection = await readOnlyChainManager.api.connection.getConnectionInfo();

    return connection;
  },
  getStateManager: async () => {
    const stateManager = await createStateManager({
      networkConfig,
    })
  }
};

