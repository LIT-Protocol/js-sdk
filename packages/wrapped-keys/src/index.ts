import {
  signMessageWithEncryptedKey,
  getEncryptedKey,
  exportPrivateKey,
  generatePrivateKey,
  importPrivateKey,
  signTransactionWithEncryptedKey,
  storeEncryptedKey,
  listEncryptedKeyMetadata,
} from './lib/api';
import {
  CHAIN_ETHEREUM,
  LIT_PREFIX,
  NETWORK_EVM,
  NETWORK_SOLANA,
  KEYTYPE_K256,
  KEYTYPE_ED25519,
} from './lib/constants';
import { setLitActionsCode } from './lib/lit-actions-client/code-repository';
import {
  LitActionCodeRepository,
  LitActionCodeRepositoryEntry,
} from './lib/lit-actions-client/types';

import type { SupportedNetworks } from './lib/service-client/types';
import type {
  SignMessageWithEncryptedKeyParams,
  GetEncryptedKeyDataParams,
  ExportPrivateKeyParams,
  GeneratePrivateKeyParams,
  ImportPrivateKeyParams,
  SignTransactionWithEncryptedKeyParams,
  ExportPrivateKeyResult,
  GeneratePrivateKeyResult,
  EthereumLitTransaction,
  SerializedTransaction,
  BaseApiParams,
  ApiParamsSupportedNetworks,
  SignTransactionParams,
  SignTransactionParamsSupportedEvm,
  SignTransactionParamsSupportedSolana,
  StoreEncryptedKeyParams,
  StoredKeyData,
  StoredKeyMetadata,
  ListEncryptedKeyMetadataParams,
  StoreEncryptedKeyResult,
  ImportPrivateKeyResult,
} from './lib/types';

export const constants = {
  CHAIN_ETHEREUM,
  LIT_PREFIX,
  NETWORK_EVM,
  NETWORK_SOLANA,
  KEYTYPE_K256,
  KEYTYPE_ED25519,
};

export const api = {
  exportPrivateKey,
  generatePrivateKey,
  getEncryptedKey,
  listEncryptedKeyMetadata,
  importPrivateKey,
  signMessageWithEncryptedKey,
  signTransactionWithEncryptedKey,
  storeEncryptedKey,
};

export const config = {
  setLitActionsCode,
};

export {
  ApiParamsSupportedNetworks,
  BaseApiParams,
  EthereumLitTransaction,
  ExportPrivateKeyParams,
  ExportPrivateKeyResult,
  GetEncryptedKeyDataParams,
  GeneratePrivateKeyParams,
  GeneratePrivateKeyResult,
  ImportPrivateKeyParams,
  ImportPrivateKeyResult,
  ListEncryptedKeyMetadataParams,
  LitActionCodeRepository,
  LitActionCodeRepositoryEntry,
  SerializedTransaction,
  SignTransactionParams,
  SignTransactionParamsSupportedEvm,
  SignTransactionParamsSupportedSolana,
  SignMessageWithEncryptedKeyParams,
  SignTransactionWithEncryptedKeyParams,
  StoreEncryptedKeyParams,
  StoreEncryptedKeyResult,
  StoredKeyData,
  StoredKeyMetadata,
  SupportedNetworks,
};
