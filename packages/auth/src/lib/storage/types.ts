import type { LitAuthData } from '../types';

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
}
