import * as GENERATED_LIT_ACTION_CID_REPOSITORY_COMMON from './lit-action-cid-repository-common.json';
import * as GENERATED_LIT_ACTION_CID_REPOSITORY from './lit-action-cid-repository.json';
import { LitCidRepository, LitCidRepositoryCommon } from './types';

function deepFreeze<T extends Record<string, any>>(obj: T): T {
  Object.freeze(obj);
  for (const key in obj) {
    if (key in obj && typeof obj[key] === 'object') {
      deepFreeze(obj[key]);
    }
  }
  return obj;
}

const LIT_ACTION_CID_REPOSITORY: LitCidRepository = deepFreeze({
  signTransaction: {
    evm: GENERATED_LIT_ACTION_CID_REPOSITORY.signTransaction.evm,
    solana: GENERATED_LIT_ACTION_CID_REPOSITORY.signTransaction.solana,
  },
  signMessage: {
    evm: GENERATED_LIT_ACTION_CID_REPOSITORY.signMessage.evm,
    solana: GENERATED_LIT_ACTION_CID_REPOSITORY.signMessage.solana,
  },
  signTypedData: {
    evm: GENERATED_LIT_ACTION_CID_REPOSITORY.signTypedData.evm,
    solana: GENERATED_LIT_ACTION_CID_REPOSITORY.signTypedData.solana,
  },
  generateEncryptedKey: {
    evm: GENERATED_LIT_ACTION_CID_REPOSITORY.generateEncryptedKey.evm,
    solana: GENERATED_LIT_ACTION_CID_REPOSITORY.generateEncryptedKey.solana,
  },
  exportPrivateKey: {
    evm: GENERATED_LIT_ACTION_CID_REPOSITORY.exportPrivateKey.evm,
    solana: GENERATED_LIT_ACTION_CID_REPOSITORY.exportPrivateKey.solana,
  },
});

const LIT_ACTION_CID_REPOSITORY_COMMON: LitCidRepositoryCommon = Object.freeze({
  batchGenerateEncryptedKeys:
    GENERATED_LIT_ACTION_CID_REPOSITORY_COMMON.batchGenerateEncryptedKeys,
});

export { LIT_ACTION_CID_REPOSITORY, LIT_ACTION_CID_REPOSITORY_COMMON };
