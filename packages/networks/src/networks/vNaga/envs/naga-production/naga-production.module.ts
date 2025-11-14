import { createBaseModule } from '../../shared/factories/BaseModuleFactory';
import type { ExpectedAccountOrWalletClient } from '../../shared/managers/contract-manager/createContractsManager';
import { createChainManager } from './chain-manager/createChainManager';
import { nagaProductionEnvironment } from './naga-production.env';

const nagaProduction = createBaseModule({
  networkConfig: nagaProductionEnvironment.getConfig(),
  moduleName: nagaProductionEnvironment.getNetworkName(),
  createChainManager: (account: ExpectedAccountOrWalletClient) =>
    createChainManager(account),
});

export type NagaProduction = typeof nagaProduction;
export { nagaProduction };
