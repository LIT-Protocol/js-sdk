import type { ExpectedAccountOrWalletClient } from '../../../shared/managers/contract-manager/createContractsManager';
import {
  createChainManagerFactory,
  createReadOnlyChainManagerFactory,
  CreateChainManagerReturn,
} from '../../../shared/factories/BaseChainManagerFactory';
import { nagaLocalEnvironment } from '../naga-local.env';

export type { CreateChainManagerReturn };

export const createChainManager = (
  accountOrWalletClient: ExpectedAccountOrWalletClient
): CreateChainManagerReturn => {
  return createChainManagerFactory(
    nagaLocalEnvironment.getConfig(),
    accountOrWalletClient
  );
};

export const createReadOnlyChainManager = createReadOnlyChainManagerFactory(
  nagaLocalEnvironment.getConfig()
);
