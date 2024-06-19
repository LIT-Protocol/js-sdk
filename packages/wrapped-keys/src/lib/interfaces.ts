import { ILitNodeClient, SessionSigsMap } from '@lit-protocol/types';

export interface StoreToDatabaseParams {
  ciphertext: string;
  dataToEncryptHash: string;
}

export interface GeneratePrivateKeyParams {
  pkpSessionSigs: SessionSigsMap;
  litActionCode: string; // TODO!: Update to use ipfsCid only when the Lit Actions are published
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

export interface SignMessageWithEncryptedKeyParams {
  pkpSessionSigs: SessionSigsMap;
  litActionCode?: string; // TODO!: Update to use ipfsCid only when the Lit Actions are published
  ipfsCid?: string;
  messageToSign: string | Uint8Array;
  litNodeClient: ILitNodeClient;
}

export interface SignTransactionWithEncryptedKeyParams<T> {
  pkpSessionSigs: SessionSigsMap;
  litActionCode?: string; // TODO!: Update to use ipfsCid only when the Lit Actions are published
  ipfsCid?: string;
  unsignedTransaction: T;
  broadcast: boolean;
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
