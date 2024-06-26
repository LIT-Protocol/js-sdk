import {
  signMessageWithEncryptedKey,
  getEncryptedKeyMetadata,
  exportPrivateKey,
  generatePrivateKey,
  importPrivateKey,
  signTransactionWithEncryptedKey,
} from './lib/api';
import { CHAIN_ETHEREUM, LIT_PREFIX } from './lib/constants';

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
  EthereumLitTransaction,
  SerializedTransaction,
  BaseApiParams,
  ApiParamsSupportedNetworks,
  SignTransactionParams,
  SignTransactionParamsSupportedEvm,
  SignTransactionParamsSupportedSolana,
} from './lib/types';

export const constants = {
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
  SignTransactionParams,
  SignTransactionParamsSupportedEvm,
  SignTransactionParamsSupportedSolana,
  ApiParamsSupportedNetworks,
  BaseApiParams,
  EthereumLitTransaction,
  SerializedTransaction,
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
