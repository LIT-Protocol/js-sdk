import type { ExpectedAccountOrWalletClient } from '../../../shared/managers/contract-manager/createContractsManager';
import {
  createChainManagerFactory,
  createReadOnlyChainManagerFactory,
  CreateChainManagerReturn,
} from '../../../shared/factories/BaseChainManagerFactory';
import { nagaStagingEnvironment } from '../naga-staging.env';

export type { CreateChainManagerReturn };

export const createChainManager = (
  accountOrWalletClient: ExpectedAccountOrWalletClient
): CreateChainManagerReturn => {
  return createChainManagerFactory(
    nagaStagingEnvironment.getConfig(),
    accountOrWalletClient
  );
};

export const createReadOnlyChainManager = createReadOnlyChainManagerFactory(
  nagaStagingEnvironment.getConfig()
);
