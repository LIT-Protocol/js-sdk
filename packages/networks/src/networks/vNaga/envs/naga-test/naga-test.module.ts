import { createBaseModule } from '../../shared/factories/BaseModuleFactory';
import { createChainManager } from './chain-manager/createChainManager';
import { nagaTestEnvironment } from './naga-test.env';
import type { ExpectedAccountOrWalletClient } from '../../shared/managers/contract-manager/createContractsManager';

const nagaTest = createBaseModule({
  networkConfig: nagaTestEnvironment.getConfig(),
  moduleName: nagaTestEnvironment.getNetworkName(),
  createChainManager: (account: ExpectedAccountOrWalletClient) =>
    createChainManager(account),
});

export type NagaTest = typeof nagaTest;
export { nagaTest };
