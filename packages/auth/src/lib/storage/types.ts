import type { LitAuthData } from '../types';

export interface LitAuthStorageProvider {
  config: unknown;

  read<T extends { pkpAddress: string }>(
    params: T,
    options?: unknown
  ): Promise<LitAuthData | null>;

  write<T extends { pkpAddress: string; authData: LitAuthData }>(
    params: T,
    options?: unknown
  ): Promise<void>;
}
