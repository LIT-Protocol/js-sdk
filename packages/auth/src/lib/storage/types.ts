import type { LitAuthData } from '../types';

/**
 * @deprecated Use the PKPInfo type from @lit-protocol/types instead
 */
export interface PKPInfo {
  tokenId: string;
  publicKey: string;
  ethAddress: string;
}

export interface LitAuthStorageProvider {
  config: unknown;

  read<T extends { address: string }>(
    params: T,
    options?: unknown
  ): Promise<LitAuthData | null>;

  write<T extends { address: string; authData: LitAuthData }>(
    params: T,
    options?: unknown
  ): Promise<void>;

  writeInnerDelegationAuthSig(
    params: {
      publicKey: string;
      authSig: string;
    },
    options?: unknown
  ): Promise<void>;

  readInnerDelegationAuthSig(params: {
    publicKey: string;
  }): Promise<string | null>;

  /**
   * Cache PKP token IDs for a specific auth method
   * @deprecated Use readPKPDetails instead for better performance
   */
  writePKPTokens(params: {
    authMethodType: number | bigint;
    authMethodId: string;
    tokenIds: string[];
  }): Promise<void>;

  /**
   * Retrieve cached PKP token IDs for a specific auth method
   * @deprecated Use readPKPDetails instead for better performance
   */
  readPKPTokens(params: {
    authMethodType: number | bigint;
    authMethodId: string;
  }): Promise<string[] | null>;

  /**
   * Cache PKP details (publicKey, ethAddress) for a specific token ID
   * This provides granular caching and respects pagination properly
   */
  writePKPDetails?(params: {
    tokenId: string;
    publicKey: string;
    ethAddress: string;
  }): Promise<void>;

  /**
   * Retrieve cached PKP details for a specific token ID
   */
  readPKPDetails?(params: {
    tokenId: string;
  }): Promise<{ publicKey: string; ethAddress: string } | null>;

  /**
   * Cache PKP token IDs for a specific owner address
   */
  writePKPTokensByAddress?(params: {
    ownerAddress: string;
    tokenIds: string[];
  }): Promise<void>;

  /**
   * Retrieve cached PKP token IDs for a specific owner address
   */
  readPKPTokensByAddress?(params: {
    ownerAddress: string;
  }): Promise<string[] | null>;

  /**
   * Cache full PKP information (tokenId, publicKey, ethAddress) for a specific auth method
   * @deprecated Use readPKPDetails/writePKPDetails for pagination-aware caching
   */
  writePKPs?(params: {
    authMethodType: number | bigint;
    authMethodId: string;
    pkps: PKPInfo[];
  }): Promise<void>;

  /**
   * Retrieve cached PKP information for a specific auth method
   * @deprecated Use readPKPDetails/writePKPDetails for pagination-aware caching
   */
  readPKPs?(params: {
    authMethodType: number | bigint;
    authMethodId: string;
  }): Promise<PKPInfo[] | null>;
}
