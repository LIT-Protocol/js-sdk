import { PKPInfo } from '@lit-protocol/types';

export interface PKPStorageProvider {
  readPKPTokens?(params: {
    authMethodType: number | bigint;
    authMethodId: string;
  }): Promise<string[] | null>;

  writePKPTokens?(params: {
    authMethodType: number | bigint;
    authMethodId: string;
    tokenIds: string[];
  }): Promise<void>;

  // New granular PKP caching by individual token ID
  readPKPDetails?(params: {
    tokenId: string;
  }): Promise<{ publicKey: string; ethAddress: string } | null>;

  writePKPDetails?(params: {
    tokenId: string;
    publicKey: string;
    ethAddress: string;
  }): Promise<void>;

  // Address-based token caching methods
  readPKPTokensByAddress?(params: {
    ownerAddress: string;
  }): Promise<string[] | null>;

  writePKPTokensByAddress?(params: {
    ownerAddress: string;
    tokenIds: string[];
  }): Promise<void>;

  // Deprecated - kept for backward compatibility
  readPKPs?(params: {
    authMethodType: number | bigint;
    authMethodId: string;
  }): Promise<PKPInfo[] | null>;

  writePKPs?(params: {
    authMethodType: number | bigint;
    authMethodId: string;
    pkps: PKPInfo[];
  }): Promise<void>;
}
