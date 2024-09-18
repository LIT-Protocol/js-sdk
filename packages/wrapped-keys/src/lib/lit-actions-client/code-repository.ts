import {
  LitActionCodeRepository,
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

/**
 * Updates the litActionCodeRepository with the provided entries.
 * @param { LitActionCodeRepositoryInput } repository - user provided repository to set
 */
function setLitActionsCode(repository: LitActionCodeRepositoryInput) {
  for (const [actionType, actionCode] of Object.entries(repository)) {
    for (const [network, code] of Object.entries(actionCode)) {
      litActionCodeRepository[actionType as LitActionType][network as Network] =
        code;
    }
  }
}

export { litActionCodeRepository, setLitActionsCode };
