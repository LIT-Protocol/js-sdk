import type { ExpectedAccountOrWalletClient } from '../../../shared/managers/contract-manager/createContractsManager';
import {
  createChainManagerFactory,
  createReadOnlyChainManagerFactory,
  CreateChainManagerReturn,
} from '../../../shared/factories/BaseChainManagerFactory';
import { nagaProductionEnvironment } from '../naga-production.env';

export type { CreateChainManagerReturn };

export const createChainManager = (
  accountOrWalletClient: ExpectedAccountOrWalletClient
): CreateChainManagerReturn => {
  return createChainManagerFactory(
    nagaProductionEnvironment.getConfig(),
    accountOrWalletClient
  );
};

export const createReadOnlyChainManager = createReadOnlyChainManagerFactory(
  nagaProductionEnvironment.getConfig()
);
