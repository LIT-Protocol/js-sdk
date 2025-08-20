import { createBaseModule } from '../../shared/factories/BaseModuleFactory';
import { createChainManager } from './chain-manager/createChainManager';
import { nagaStagingEnvironment } from './naga-staging.env';
import type { ExpectedAccountOrWalletClient } from '../../shared/managers/contract-manager/createContractsManager';

const baseModule = createBaseModule({
  networkConfig: nagaStagingEnvironment.getConfig(),
  moduleName: 'naga-staging',
  createChainManager: (account: ExpectedAccountOrWalletClient) =>
    createChainManager(account),
});

// Add getChainManager method for backward compatibility
const nagaStaging = {
  ...baseModule,
  getChainManager: (accountOrWalletClient: ExpectedAccountOrWalletClient) =>
    createChainManager(accountOrWalletClient),
};

export type NagaStaging = typeof nagaStaging;
export { nagaStaging };
