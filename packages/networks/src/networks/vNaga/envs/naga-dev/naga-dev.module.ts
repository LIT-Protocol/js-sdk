import { createBaseModule } from '../../shared/factories/BaseModuleFactory';
import { createChainManager } from './chain-manager/createChainManager';
import { nagaDevEnvironment } from './naga-dev.env';
import type { ExpectedAccountOrWalletClient } from '../../shared/managers/contract-manager/createContractsManager';

const nagaDev = createBaseModule({
  networkConfig: nagaDevEnvironment.getConfig(),
  moduleName: nagaDevEnvironment.getNetworkName(),
  createChainManager: (account: ExpectedAccountOrWalletClient) =>
    createChainManager(account),
});

export type NagaDevUnifiedModule = typeof nagaDev;
export { nagaDev };
