import { createBaseModule } from '../../shared/factories/BaseModuleFactory';
import { createChainManager } from './chain-manager/createChainManager';
import { nagaLocalEnvironment } from './naga-local.env';
import type { ExpectedAccountOrWalletClient } from '../../shared/managers/contract-manager/createContractsManager';

const baseModule = createBaseModule({
  networkConfig: nagaLocalEnvironment.getConfig(),
  moduleName: nagaLocalEnvironment.getNetworkName(),
  createChainManager: (account: ExpectedAccountOrWalletClient) =>
    createChainManager(account),
});

// Add local-specific methods and maintain backward compatibility
const nagaLocal = {
  ...baseModule,
  // Local environment specific getter for private key
  getPrivateKey: () => nagaLocalEnvironment.getPrivateKey(),
};

export type NagaLocal = typeof nagaLocal;
export { nagaLocal };
