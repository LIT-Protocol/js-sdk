import { batchGenerateEncryptedKeys } from './common/batchGenerateEncryptedKeys';
import { exportPrivateKey } from './common/exportPrivateKey';
import { decryptWrappedKeyForDelegatee } from './delegated/decryptWrappedKeyForDelegatee';
import { generateEncryptedEthereumPrivateKey } from './ethereum/generateEncryptedEthereumPrivateKey';
import { signMessageWithEncryptedEthereumKey } from './ethereum/signMessageWithEncryptedEthereumKey';
import { signTransactionWithEncryptedEthereumKey } from './ethereum/signTransactionWithEncryptedEthereumKey';
import { generateEncryptedSolanaPrivateKey } from './solana/generateEncryptedSolanaPrivateKey';
import { signMessageWithEncryptedSolanaKey } from './solana/signMessageWithEncryptedSolanaKey';
import { signTransactionWithEncryptedSolanaKey } from './solana/signTransactionWithEncryptedSolanaKey';

export const rawActionFunctions = {
  exportPrivateKey,
  batchGenerateEncryptedKeys,
  generateEncryptedEthereumPrivateKey,
  signMessageWithEncryptedEthereumKey,
  signTransactionWithEncryptedEthereumKey,
  generateEncryptedSolanaPrivateKey,
  signMessageWithEncryptedSolanaKey,
  signTransactionWithEncryptedSolanaKey,
  decryptWrappedKeyForDelegatee,
};
