import { readFileSync } from 'fs';
import { resolve } from 'path';

const bundledFilePath = './dist/signAndSendTxWithSolanaEncryptedKey.js';

export const signAndSendTxWithSolanaEncryptedKeyLitAction = readFileSync(
  resolve(bundledFilePath),
  'utf-8'
);
