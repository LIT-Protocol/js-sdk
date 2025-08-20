import { createBaseModule } from '../../shared/factories/BaseModuleFactory';
import { createChainManager } from './chain-manager/createChainManager';
import { nagaDevEnvironment } from './naga-dev.env';
import type { ExpectedAccountOrWalletClient } from '../../shared/managers/contract-manager/createContractsManager';

const baseModule = createBaseModule({
  networkConfig: nagaDevEnvironment.getConfig(),
  moduleName: nagaDevEnvironment.getNetworkName(),
  createChainManager: (account: ExpectedAccountOrWalletClient) =>
    createChainManager(account),
});

// Add getChainManager method for backward compatibility
const nagaDev = {
  ...baseModule,
  getChainManager: (accountOrWalletClient: ExpectedAccountOrWalletClient) =>
    createChainManager(accountOrWalletClient),
};

export type NagaDevUnifiedModule = typeof nagaDev;
export { nagaDev };
