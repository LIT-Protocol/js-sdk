import {
  LitActionCodeRepository,
  LitActionCodeRepositoryEntry,
  LitActionCodeRepositoryInput,
  LitActionType,
} from './types';
import { Network } from '../types';

/**
 * A repository for managing Lit Actions related to blockchain operations.
 * The repository provides functionalities for handling transactions, messages,
 * encrypted keys, and private keys across multiple blockchain platforms.
 * @type {LitActionCodeRepository}
 */
const litActionCodeRepository: LitActionCodeRepository = Object.freeze({
  signTransaction: Object.seal({
    evm: '',
    solana: '',
  }),
  signMessage: Object.seal({
    evm: '',
    solana: '',
  }),
  generateEncryptedKey: Object.seal({
    evm: '',
    solana: '',
  }),
  exportPrivateKey: Object.seal({
    evm: '',
    solana: '',
  }),
});

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
    !entry ||
    ('evm' in entry &&
      typeof (entry as LitActionCodeRepositoryEntry).evm !== 'string') ||
    ('solana' in entry &&
      typeof (entry as LitActionCodeRepositoryEntry).solana !== 'string') ||
    Object.keys(entry).some((key) => !['evm', 'solana'].includes(key))
  ) {
    throw new Error(
      `Invalid LitActionRepository entry: ${JSON.stringify(entry)}`
    );
  }
}

/**
 * Updates the litActionCodeRepository with the provided entries.
 * @param { LitActionCodeRepositoryInput } repository - user provided repository to set
 */
function setLitActionsCode(repository: LitActionCodeRepositoryInput) {
  for (const [actionType, actionCode] of Object.entries(repository)) {
    assertIsLitActionKey(actionType as LitActionType);
    assertIsLitActionRepositoryEntry(actionCode);

    for (const [network, code] of Object.entries(actionCode)) {
      litActionCodeRepository[actionType as LitActionType][network as Network] =
        code;
    }
  }
}

export { litActionCodeRepository, setLitActionsCode };