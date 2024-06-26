import {
  signMessageWithEncryptedKey,
  getEncryptedKeyMetadata,
  exportPrivateKey,
  generatePrivateKey,
  importPrivateKey,
  signTransactionWithEncryptedKey,
} from './lib/api';
import {
  NETWORK_SOLANA,
  NETWORK_EVM,
  NETWORK_CUSTOM,
  CHAIN_ETHEREUM,
  LIT_PREFIX,
} from './lib/constants';

import type {
  StoredKeyMetadata,
  SupportedNetworks,
} from './lib/service-client';
import type {
  SignMessageWithEncryptedKeyParams,
  GetEncryptedKeyMetadataParams,
  ExportPrivateKeyParams,
  GeneratePrivateKeyParams,
  ImportPrivateKeyParams,
  SignTransactionWithEncryptedKeyParams,
  ExportPrivateKeyResult,
  GeneratePrivateKeyResult,
} from './lib/types';

export const constants = {
  NETWORK_SOLANA,
  NETWORK_EVM,
  NETWORK_CUSTOM,
  CHAIN_ETHEREUM,
  LIT_PREFIX,
};

export const api = {
  signMessageWithEncryptedKey,
  getEncryptedKeyMetadata,
  exportPrivateKey,
  generatePrivateKey,
  importPrivateKey,
  signTransactionWithEncryptedKey,
};

export {
  StoredKeyMetadata,
  SupportedNetworks,
  SignMessageWithEncryptedKeyParams,
  GetEncryptedKeyMetadataParams,
  ExportPrivateKeyParams,
  ExportPrivateKeyResult,
  GeneratePrivateKeyParams,
  GeneratePrivateKeyResult,
  ImportPrivateKeyParams,
  SignTransactionWithEncryptedKeyParams,
};
