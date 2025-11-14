import { createBaseModule } from '../../shared/factories/BaseModuleFactory';
import type { ExpectedAccountOrWalletClient } from '../../shared/managers/contract-manager/createContractsManager';
import { createChainManager } from './chain-manager/createChainManager';
import { nagaMainnetEnvironment } from './naga-mainnet.env';

const nagaMainnet = createBaseModule({
  networkConfig: nagaMainnetEnvironment.getConfig(),
  moduleName: nagaMainnetEnvironment.getNetworkName(),
  createChainManager: (account: ExpectedAccountOrWalletClient) =>
    createChainManager(account),
});

export type NagaMainnet = typeof nagaMainnet;
export { nagaMainnet };
