import type { ExpectedAccountOrWalletClient } from '../../../shared/managers/contract-manager/createContractsManager';
import {
  createChainManagerFactory,
  createReadOnlyChainManagerFactory,
  CreateChainManagerReturn,
} from '../../../shared/factories/BaseChainManagerFactory';
import { nagaMainnetEnvironment } from '../naga-mainnet.env';

export type { CreateChainManagerReturn };

export const createChainManager = (
  accountOrWalletClient: ExpectedAccountOrWalletClient
): CreateChainManagerReturn => {
  return createChainManagerFactory(
    nagaMainnetEnvironment.getConfig(),
    accountOrWalletClient
  );
};

export const createReadOnlyChainManager = createReadOnlyChainManagerFactory(
  nagaMainnetEnvironment.getConfig()
);
