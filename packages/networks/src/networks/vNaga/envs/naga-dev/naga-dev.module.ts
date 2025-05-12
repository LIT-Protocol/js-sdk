import { HTTP, HTTPS, LIT_NETWORK } from '@lit-protocol/constants';
import { ethers } from 'ethers';
import type { LitNetworkModule } from '../../../LitNetworkModule';
import { networkConfig } from './naga-dev.config';
import type { LitContractContext, EpochInfo } from '@lit-protocol/types';
import { createStateManager } from './state-manager/createStateManager';
import { privateKeyToAccount } from 'viem/accounts';
import { createReadOnlyChainManager } from '@nagaDev/ChainManager';
// import { LitNagaNetworkModule } from '../../LitNagaNetworkModule';

export const nagaDevModule = {
  id: 'naga',
  getNetworkName: () => networkConfig.network,
  getHttpProtocol: () => networkConfig.httpProtocol,
  getEndpoints: () => networkConfig.endpoints,
  getRpcUrl: () => networkConfig.rpcUrl,
  getChainConfig: () => networkConfig.chainConfig,
  getConnectionInfo: async () => {
    const readOnlyChainManager = createReadOnlyChainManager();

    // Explicitly type 'connection' with the awaited return type of the SDK's getConnectionInfo
    const connection =
      await readOnlyChainManager.api.connection.getConnectionInfo();

    return connection;
  },
  getStateManager: async (): Promise<
    Awaited<ReturnType<typeof createStateManager>>
  > => {
    return await createStateManager({
      networkConfig,
    });
  },
};

export type NagaDevStateManagerType = Awaited<
  ReturnType<typeof createStateManager>
>;

export type NagaDevModule = typeof nagaDevModule;
