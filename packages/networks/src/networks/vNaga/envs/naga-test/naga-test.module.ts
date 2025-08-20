import { createBaseModule } from '../../shared/factories/BaseModuleFactory';
import { createChainManager } from './chain-manager/createChainManager';
import { nagaTestEnvironment } from './naga-test.env';
import type { ExpectedAccountOrWalletClient } from '../../shared/managers/contract-manager/createContractsManager';

const baseModule = createBaseModule({
  networkConfig: nagaTestEnvironment.getConfig(),
  moduleName: 'naga-test',
  createChainManager: (account: ExpectedAccountOrWalletClient) =>
    createChainManager(account),
});

const nagaTest = {
  ...baseModule,
  getChainManager: (accountOrWalletClient: ExpectedAccountOrWalletClient) =>
    createChainManager(accountOrWalletClient),
};

export type NagaTest = typeof nagaTest;
export { nagaTest };
