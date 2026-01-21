import { createBaseModule } from '../../../vNaga/shared/factories/BaseModuleFactory';
import type { ExpectedAccountOrWalletClient } from '../../../vNaga/shared/managers/contract-manager/createContractsManager';
import { createChainManager } from './chain-manager/createChainManager';
import { datilEnvironment } from './datil.env';

const datil = createBaseModule({
  networkConfig: datilEnvironment.getConfig(),
  moduleName: datilEnvironment.getNetworkName(),
  createChainManager: (account: ExpectedAccountOrWalletClient) =>
    createChainManager(account),
});

export type DatilModule = typeof datil;
export { datil };
