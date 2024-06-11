import { readFileSync } from 'fs';
import { resolve } from 'path';

const bundledFilePath = './dist/signMessageWithSolanaEncryptedKey.js';

export const signMessageWithSolanaEncryptedKeyLitAction = readFileSync(
  resolve(bundledFilePath),
  'utf-8'
);
