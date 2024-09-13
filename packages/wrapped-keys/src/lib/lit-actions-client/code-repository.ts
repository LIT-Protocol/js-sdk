import { LitActionCodeRepository, LitActionCodeRepositoryEntry } from './types';

/**
 * A repository for managing Lit Actions related to blockchain operations.
 * The repository provides functionalities for handling transactions, messages,
 * encrypted keys, and private keys across multiple blockchain platforms.
 * @type {LitActionCodeRepository}
 */
const litActionCodeRepository: LitActionCodeRepository = {
  signTransaction: {
    evm: '',
    solana: '',
  },
  signMessage: {
    evm: '',
    solana: '',
  },
  generateEncryptedKey: {
    evm: '',
    solana: '',
  },
  exportPrivateKey: {
    evm: '',
    solana: '',
  },
};

function assertIsLitActionKey(
  key: string
): asserts key is keyof LitActionCodeRepository {
  if (!(key in litActionCodeRepository)) {
    throw new Error(
      `Invalid key: ${key}; must be one of ${Object.keys(
        litActionCodeRepository
      ).join(',')}`
    );
  }
}

/**
 * Type Guard for LitActionCodeRepositoryEntry
 */
function assertIsLitActionRepositoryEntry(
  entry: unknown
): asserts entry is LitActionCodeRepositoryEntry {
  if (
    typeof entry !== 'object' ||
    entry === null ||
    !('evm' in entry) ||
    !('solana' in entry) ||
    // @ts-expect-error This is an assertion function
    typeof (entry as object).evm !== 'string' ||
    // @ts-expect-error This is an assertion function
    typeof (entry as object).solana !== 'string'
  ) {
    throw new Error(
      `Invalid LitActionRepository entry: ${JSON.stringify(entry)}`
    );
  }
}

/**
 * @param repository - user provided repository to set
 */
function setLitActionsCode(repository: LitActionCodeRepository) {
  const userProvidedRepositoryCount = Object.keys(repository).length;
  const litActionCodeRepositoryCount = Object.keys(
    litActionCodeRepository
  ).length;

  if (userProvidedRepositoryCount !== litActionCodeRepositoryCount) {
    throw new Error(
      `Invalid repository shape; expected ${litActionCodeRepositoryCount}`
    );
  }

  for (const key in repository) {
    assertIsLitActionKey(key);
    assertIsLitActionRepositoryEntry(repository[key]);

    litActionCodeRepository[key] = repository[key];
  }
}

export { litActionCodeRepository, setLitActionsCode };
