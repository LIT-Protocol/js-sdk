import * as exportPrivateKey from './generated/common/exportPrivateKey';
import * as generateEncryptedEthereumPrivateKey from './generated/ethereum/generateEncryptedEthereumPrivateKey';
import * as signMessageWithEthereumEncryptedKey from './generated/ethereum/signMessageWithEncryptedEthereumKey';
import * as signTransactionWithEthereumEncryptedKey from './generated/ethereum/signTransactionWithEncryptedEthereumKey';
import * as generateEncryptedSolanaPrivateKey from './generated/solana/generateEncryptedSolanaPrivateKey';
import * as signMessageWithSolanaEncryptedKey from './generated/solana/signMessageWithSolanaEncryptedKey';
import * as signTransactionWithSolanaEncryptedKey from './generated/solana/signTransactionWithSolanaEncryptedKey';

import type { LitActionCodeRepository } from '@lit-protocol/wrapped-keys';

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

export {
  // Individual exports to allow tree-shaking and only importing the lit actions you need
  exportPrivateKey,
  generateEncryptedEthereumPrivateKey,
  signMessageWithEthereumEncryptedKey,
  signTransactionWithEthereumEncryptedKey,
  generateEncryptedSolanaPrivateKey,
  signMessageWithSolanaEncryptedKey,
  signTransactionWithSolanaEncryptedKey,
  // Full export to bundle all lit actions
  litActionRepository,
};
