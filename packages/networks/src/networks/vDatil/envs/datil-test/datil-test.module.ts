import { createBaseModule } from '../../../vNaga/shared/factories/BaseModuleFactory';
import type { ExpectedAccountOrWalletClient } from '../../../vNaga/shared/managers/contract-manager/createContractsManager';
import { createChainManager } from './chain-manager/createChainManager';
import { datilTestEnvironment } from './datil-test.env';

const datilTest = createBaseModule({
  networkConfig: datilTestEnvironment.getConfig(),
  moduleName: datilTestEnvironment.getNetworkName(),
  createChainManager: (account: ExpectedAccountOrWalletClient) =>
    createChainManager(account),
});

export type DatilTestModule = typeof datilTest;
export { datilTest };
