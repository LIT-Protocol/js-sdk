import * as batchGenerateEncryptedKeys from './generated/common/batchGenerateEncryptedKeys';
import * as exportPrivateKey from './generated/common/exportPrivateKey';
import * as generateEncryptedEthereumPrivateKey from './generated/ethereum/generateEncryptedEthereumPrivateKey';
import * as signMessageWithEthereumEncryptedKey from './generated/ethereum/signMessageWithEncryptedEthereumKey';
import * as signTransactionWithEthereumEncryptedKey from './generated/ethereum/signTransactionWithEncryptedEthereumKey';
import * as signTypedDataWithEthereumEncryptedKey from './generated/ethereum/signTypedDataWithEncryptedEthereumKey';
import * as generateEncryptedSolanaPrivateKey from './generated/solana/generateEncryptedSolanaPrivateKey';
import * as signMessageWithSolanaEncryptedKey from './generated/solana/signMessageWithEncryptedSolanaKey';
import * as signTransactionWithSolanaEncryptedKey from './generated/solana/signTransactionWithEncryptedSolanaKey';
import { rawActionFunctions } from './lib/raw-action-functions';

import type {
  LitActionCodeRepository,
  LitActionCodeRepositoryCommon,
} from '@lit-protocol/wrapped-keys';

const litActionRepository: LitActionCodeRepository = {
  signTransaction: {
    evm: signTransactionWithEthereumEncryptedKey.code,
    solana: signTransactionWithSolanaEncryptedKey.code,
  },
  signMessage: {
    evm: signMessageWithEthereumEncryptedKey.code,
    solana: signMessageWithSolanaEncryptedKey.code,
  },
  signTypedData: {
    evm: signTypedDataWithEthereumEncryptedKey.code,
    solana: '',
  },
  generateEncryptedKey: {
    evm: generateEncryptedEthereumPrivateKey.code,
    solana: generateEncryptedSolanaPrivateKey.code,
  },
  exportPrivateKey: {
    evm: exportPrivateKey.code,
    solana: exportPrivateKey.code,
  },
};

const litActionRepositoryCommon: LitActionCodeRepositoryCommon = {
  batchGenerateEncryptedKeys: batchGenerateEncryptedKeys.code,
};

export {
  // Raw functions, <not wrapped in IIFEs>, for consumers to be able to compose these into their own LIT actions
  // Facilitates running e.g. `batchGenerateEncryptedKeys` using `Lit.Actions.runOnce` inside of another action
  rawActionFunctions,

  // Individual exports to allow tree-shaking and only importing the lit actions you need
  batchGenerateEncryptedKeys,
  exportPrivateKey,
  generateEncryptedEthereumPrivateKey,
  signMessageWithEthereumEncryptedKey,
  signTransactionWithEthereumEncryptedKey,
  signTypedDataWithEthereumEncryptedKey,
  generateEncryptedSolanaPrivateKey,
  signMessageWithSolanaEncryptedKey,
  signTransactionWithSolanaEncryptedKey,

  // Full export to bundle all lit actions
  litActionRepository,
  litActionRepositoryCommon,
};
