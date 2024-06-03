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
  litNodeClient: ILitNodeClient;
}
