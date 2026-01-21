import type { ExpectedAccountOrWalletClient } from '../../../../vNaga/shared/managers/contract-manager/createContractsManager';
import {
  createChainManagerFactory,
  createReadOnlyChainManagerFactory,
  CreateChainManagerReturn,
} from '../../../../vNaga/shared/factories/BaseChainManagerFactory';
import { datilDevEnvironment } from '../datil-dev.env';

export type { CreateChainManagerReturn };

export const createChainManager = (
  accountOrWalletClient: ExpectedAccountOrWalletClient
): CreateChainManagerReturn => {
  return createChainManagerFactory(
    datilDevEnvironment.getConfig(),
    accountOrWalletClient
  );
};

export const createReadOnlyChainManager = createReadOnlyChainManagerFactory(
  datilDevEnvironment.getConfig()
);
