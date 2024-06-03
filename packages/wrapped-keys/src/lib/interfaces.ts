import { ILitNodeClient, SessionSigsMap } from '@lit-protocol/types';

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

export interface SignWithEncryptedKeyParams<T> {
  pkpSessionSigs: SessionSigsMap;
  litActionCid: string;
  unsignedTransaction: T;
  broadcast: boolean;
  litNodeClient: ILitNodeClient;
}

interface BaseLitTransaction {
  toAddress: string;
  value: string;
}

interface EthereumLitTransaction extends BaseLitTransaction {
  gasPrice?: string;
  gasLimit?: number;
  data?: string;
}

interface SolanaLitTransaction extends BaseLitTransaction {}

export type LitTransaction = EthereumLitTransaction | SolanaLitTransaction;

// Same for both Ethereum & Solana
export interface LitMessage {
  message: string;
}
