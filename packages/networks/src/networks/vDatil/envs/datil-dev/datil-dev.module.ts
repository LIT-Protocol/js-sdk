import { createBaseModule } from '../../../vNaga/shared/factories/BaseModuleFactory';
import type { ExpectedAccountOrWalletClient } from '../../../vNaga/shared/managers/contract-manager/createContractsManager';
import { createChainManager } from './chain-manager/createChainManager';
import { datilDevEnvironment } from './datil-dev.env';

const datilDev = createBaseModule({
  networkConfig: datilDevEnvironment.getConfig(),
  moduleName: datilDevEnvironment.getNetworkName(),
  createChainManager: (account: ExpectedAccountOrWalletClient) =>
    createChainManager(account),
});

export type DatilDevModule = typeof datilDev;
export { datilDev };
