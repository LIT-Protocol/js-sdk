import {
  batchGeneratePrivateKeys,
  exportPrivateKey,
  generatePrivateKey,
  getEncryptedKey,
  importPrivateKey,
  listEncryptedKeyMetadata,
  signMessageWithEncryptedKey,
  signTransactionWithEncryptedKey,
  storeEncryptedKey,
  storeEncryptedKeyBatch,
  updateEncryptedKey,
} from './lib/api';
import {
  CHAIN_ETHEREUM,
  KEYTYPE_ED25519,
  KEYTYPE_K256,
  LIT_PREFIX,
  NETWORK_EVM,
  NETWORK_SOLANA,
} from './lib/constants';
import {
  setLitActionsCode,
  setLitActionsCodeCommon,
} from './lib/lit-actions-client/code-repository';

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
  storeEncryptedKeyBatch,
  batchGeneratePrivateKeys,
  updateEncryptedKey,
};

export const config = {
  setLitActionsCode,
  setLitActionsCodeCommon,
};

export type {
  ApiParamsSupportedNetworks,
  BaseApiParams,
  BatchGeneratePrivateKeysResult,
  EthereumLitTransaction,
  ExportPrivateKeyParams,
  ExportPrivateKeyResult,
  GeneratePrivateKeyParams,
  GeneratePrivateKeyResult,
  GetEncryptedKeyDataParams,
  ImportPrivateKeyParams,
  ImportPrivateKeyResult,
  ListEncryptedKeyMetadataParams,
  LitClient,
  SerializedTransaction,
  SignMessageWithEncryptedKeyParams,
  SignTransactionParams,
  SignTransactionParamsSupportedEvm,
  SignTransactionParamsSupportedSolana,
  SignTransactionWithEncryptedKeyParams,
  StoreEncryptedKeyBatchParams,
  StoreEncryptedKeyBatchResult,
  StoreEncryptedKeyParams,
  StoreEncryptedKeyResult,
  StoredKeyData,
  StoredKeyMetadata,
  UpdateEncryptedKeyParams,
  UpdateEncryptedKeyResult,
  WrappedKeyVersion,
} from './lib/types';

export type {
  LitActionCodeRepository,
  LitActionCodeRepositoryCommon,
  LitActionCodeRepositoryEntry,
} from './lib/lit-actions-client/types';

export type { SupportedNetworks } from './lib/service-client/types';
