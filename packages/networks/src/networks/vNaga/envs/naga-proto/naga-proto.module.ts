import { createBaseModule } from '../../shared/factories/BaseModuleFactory';
import type { ExpectedAccountOrWalletClient } from '../../shared/managers/contract-manager/createContractsManager';
import { createChainManager } from './chain-manager/createChainManager';
import { nagaProtoEnvironment } from './naga-proto.env';

const nagaProto = createBaseModule({
  networkConfig: nagaProtoEnvironment.getConfig(),
  moduleName: nagaProtoEnvironment.getNetworkName(),
  createChainManager: (account: ExpectedAccountOrWalletClient) =>
    createChainManager(account),
});

export type NagaProto = typeof nagaProto;
export { nagaProto };
