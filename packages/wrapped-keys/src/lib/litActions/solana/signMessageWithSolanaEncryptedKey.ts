import { readFileSync } from 'fs';
import { resolve } from 'path';

const bundledFilePath = resolve(
  __dirname,
  './dist/signMessageWithSolanaEncryptedKey.js'
);

export const signMessageWithSolanaEncryptedKeyLitAction = readFileSync(
  bundledFilePath,
  'utf-8'
);
