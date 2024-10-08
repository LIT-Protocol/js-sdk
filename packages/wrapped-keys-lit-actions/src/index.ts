import * as batchGenerateEncryptedKeys from './generated/common/batchGenerateEncryptedKeys';
import * as exportPrivateKey from './generated/common/exportPrivateKey';
import * as generateEncryptedEthereumPrivateKey from './generated/ethereum/generateEncryptedEthereumPrivateKey';
import * as signMessageWithEthereumEncryptedKey from './generated/ethereum/signMessageWithEncryptedEthereumKey';
import * as signTransactionWithEthereumEncryptedKey from './generated/ethereum/signTransactionWithEncryptedEthereumKey';
import * as generateEncryptedSolanaPrivateKey from './generated/solana/generateEncryptedSolanaPrivateKey';
import * as signMessageWithSolanaEncryptedKey from './generated/solana/signMessageWithEncryptedSolanaKey';
import * as signTransactionWithSolanaEncryptedKey from './generated/solana/signTransactionWithEncryptedSolanaKey';

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
  // Individual exports to allow tree-shaking and only importing the lit actions you need
  batchGenerateEncryptedKeys,
  exportPrivateKey,
  generateEncryptedEthereumPrivateKey,
  signMessageWithEthereumEncryptedKey,
  signTransactionWithEthereumEncryptedKey,
  generateEncryptedSolanaPrivateKey,
  signMessageWithSolanaEncryptedKey,
  signTransactionWithSolanaEncryptedKey,

  // Full export to bundle all lit actions
  litActionRepository,
  litActionRepositoryCommon,
};
