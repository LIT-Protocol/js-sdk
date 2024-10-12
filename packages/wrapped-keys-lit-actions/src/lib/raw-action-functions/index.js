const {
  batchGenerateEncryptedKeys,
} = require('./common/batchGenerateEncryptedKeys');
const { exportPrivateKey } = require('./common/exportPrivateKey');
const {
  generateEncryptedEthereumPrivateKey,
} = require('./ethereum/generateEncryptedEthereumPrivateKey');
const {
  signMessageWithEncryptedEthereumKey,
} = require('./ethereum/signMessageWithEncryptedEthereumKey');
const {
  signTransactionWithEncryptedEthereumKey,
} = require('./ethereum/signTransactionWithEncryptedEthereumKey');
const {
  generateEncryptedSolanaPrivateKey,
} = require('./solana/generateEncryptedSolanaPrivateKey');
const {
  signMessageWithEncryptedSolanaKey,
} = require('./solana/signMessageWithEncryptedSolanaKey');
const {
  signTransactionWithEncryptedSolanaKey,
} = require('./solana/signTransactionWithEncryptedSolanaKey');

export const rawActionFunctions = {
  exportPrivateKey,
  batchGenerateEncryptedKeys,
  generateEncryptedEthereumPrivateKey,
  signMessageWithEncryptedEthereumKey,
  signTransactionWithEncryptedEthereumKey,
  generateEncryptedSolanaPrivateKey,
  signMessageWithEncryptedSolanaKey,
  signTransactionWithEncryptedSolanaKey,
};
