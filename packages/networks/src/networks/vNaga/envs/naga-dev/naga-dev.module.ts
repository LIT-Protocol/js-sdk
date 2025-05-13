import { createReadOnlyChainManager } from '@nagaDev/ChainManager';
import { networkConfig } from './naga-dev.config';
import {
  CallbackParams,
  createStateManager,
} from './state-manager/createStateManager';
import { version } from '@lit-protocol/constants';
import { ConnectionInfo } from '@vNaga/LitChainClient';
import { LitNetworkModule } from '../../../LitNetworkModule';

export const nagaDevModule = {
  id: 'naga',
  version: `${version}-naga-dev`,
  config: {
    requiredAttestation: false,
    abortTimeout: 20_000,
    minimumThreshold: networkConfig.minimumThreshold,
  },
  getNetworkName: () => networkConfig.network,
  getHttpProtocol: () => networkConfig.httpProtocol,
  getEndpoints: () => networkConfig.endpoints,
  getRpcUrl: () => networkConfig.rpcUrl,
  getChainConfig: () => networkConfig.chainConfig,
  /**
   * @deprecated Prefer using {@link getStateManager} to access connection information and other network state.
   * Retrieves connection information directly using the read-only chain manager.
   * @returns {Promise<ConnectionInfo>} A promise that resolves with the connection information.
   */
  getConnectionInfo: async (): Promise<ConnectionInfo> => {
    const readOnlyChainManager = createReadOnlyChainManager();

    // Explicitly type 'connection' with the awaited return type of the SDK's getConnectionInfo
    const connection =
      await readOnlyChainManager.api.connection.getConnectionInfo();

    return connection;
  },
  getStateManager: async <T>(params: {
    callback: (params: CallbackParams) => Promise<T>;
    networkModule: LitNetworkModule;
  }): Promise<Awaited<ReturnType<typeof createStateManager<T>>>> => {
    return await createStateManager<T>({
      networkConfig,
      callback: params.callback,
      networkModule: params.networkModule,
    });
  },
};

export type NagaDevStateManagerType = Awaited<
  ReturnType<typeof createStateManager>
>;

export type NagaDevModule = typeof nagaDevModule;
