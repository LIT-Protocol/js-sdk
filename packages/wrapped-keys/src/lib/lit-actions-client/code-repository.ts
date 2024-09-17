import { LitActionCodeRepository } from './types';

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
 * @param repository - user provided repository to set
 */
function setLitActionsCode(repository: LitActionCodeRepository) {
  const actions = Object.keys(repository) as (keyof typeof repository)[];

  for (const action of actions) {
    const networks = Object.keys(
      repository[action]
    ) as (keyof (typeof repository)[typeof action])[];

    for (const network of networks) {
      litActionCodeRepository[action][network] = repository[action][network];
    }
  }
}

export { litActionCodeRepository, setLitActionsCode };
