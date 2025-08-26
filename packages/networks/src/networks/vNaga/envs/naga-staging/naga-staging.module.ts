import { createBaseModule } from '../../shared/factories/BaseModuleFactory';
import { createChainManager } from './chain-manager/createChainManager';
import { nagaStagingEnvironment } from './naga-staging.env';
import type { ExpectedAccountOrWalletClient } from '../../shared/managers/contract-manager/createContractsManager';

const nagaStaging = createBaseModule({
  networkConfig: nagaStagingEnvironment.getConfig(),
  moduleName: 'naga-staging',
  createChainManager: (account: ExpectedAccountOrWalletClient) =>
    createChainManager(account),
});

export type NagaStaging = typeof nagaStaging;
export { nagaStaging };
