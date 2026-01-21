import type { ExpectedAccountOrWalletClient } from '../../../../vNaga/shared/managers/contract-manager/createContractsManager';
import {
  createChainManagerFactory,
  createReadOnlyChainManagerFactory,
  CreateChainManagerReturn,
} from '../../../../vNaga/shared/factories/BaseChainManagerFactory';
import { datilTestEnvironment } from '../datil-test.env';

export type { CreateChainManagerReturn };

export const createChainManager = (
  accountOrWalletClient: ExpectedAccountOrWalletClient
): CreateChainManagerReturn => {
  return createChainManagerFactory(
    datilTestEnvironment.getConfig(),
    accountOrWalletClient
  );
};

export const createReadOnlyChainManager = createReadOnlyChainManagerFactory(
  datilTestEnvironment.getConfig()
);
