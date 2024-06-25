import { ILitNodeClient, SessionSigsMap } from '@lit-protocol/types';
import { Network } from './constants';

export interface StoreToDatabaseParams {
  ciphertext: string;
  dataToEncryptHash: string;
}

export interface CustomGeneratePrivateKeyParams {
  pkpSessionSigs: SessionSigsMap;
  litActionIpfsCid?: string;
  litActionCode?: string;
  litNodeClient: ILitNodeClient;
}

export interface GeneratePrivateKeyParams {
  pkpSessionSigs: SessionSigsMap;
  network: Network;
  litNodeClient: ILitNodeClient;
}

export interface GeneratePrivateKeyResponse {
  pkpAddress: string;
  generatedPublicKey: string;
}

export interface ImportPrivateKeyParams {
  pkpSessionSigs: SessionSigsMap;
  privateKey: string;
  litNodeClient: ILitNodeClient;
}

export interface ImportPrivateKeyResponse {
  pkpAddress: string;
}

export interface ExportPrivateKeyParams {
  pkpSessionSigs: SessionSigsMap;
  litNodeClient: ILitNodeClient;
}

export interface ExportPrivateKeyResponse {
  pkpAddress: string;
  ciphertext: string;
  dataToEncryptHash: string;
}

export interface CustomSignMessageWithEncryptedKeyParams {
  pkpSessionSigs: SessionSigsMap;
  litActionIpfsCid?: string;
  litActionCode?: string;
  messageToSign: string | Uint8Array;
  params?: Record<string, any>;
  litNodeClient: ILitNodeClient;
}

export interface SignMessageWithEncryptedKeyParams {
  pkpSessionSigs: SessionSigsMap;
  network: Network;
  messageToSign: string | Uint8Array;
  litNodeClient: ILitNodeClient;
}

export interface SignTransactionWithEncryptedKeyParams<T> {
  pkpSessionSigs: SessionSigsMap;
  network: Network;
  unsignedTransaction: T;
  broadcast: boolean;
  litNodeClient: ILitNodeClient;
}

export interface CustomSignTransactionWithEncryptedKeyParams {
  pkpSessionSigs: SessionSigsMap;
  litActionIpfsCid?: string;
  litActionCode?: string;
  serializedTransaction: string;
  broadcast: boolean;
  params?: Record<string, any>;
  litNodeClient: ILitNodeClient;
}

interface BaseLitTransaction {
  chain: string;
}

export interface EthereumLitTransaction extends BaseLitTransaction {
  toAddress: string;
  value: string;
  chainId: number;
  gasPrice?: string;
  gasLimit?: number;
  dataHex?: string;
}

export interface SolanaLitTransaction extends BaseLitTransaction {
  serializedTransaction: string;
}

export type LitTransaction = EthereumLitTransaction | SolanaLitTransaction;
