// import type { NagaDevModule20250404 } from '@lit-protocol/networks';
import { NagaLocalModule } from '@lit-protocol/networks';
import { NagaDevModule } from '@lit-protocol/networks';
import { NagaStagingModule } from '@lit-protocol/networks';
import { NagaLitClient } from './types/NagaLitClient.type';

/**
 * ========== All Network Modules ==========
 */
export type LitNetworkModule = NagaNetworkModule;
// | DatilNetworkModule;

/**
 * ========== (v8) All Naga Network Modules ==========
 */
export type NagaNetworkModule =
  | NagaLocalModule
  | NagaDevModule
  | NagaStagingModule;

/**
 * ========== (v7) All Datil Network Modules ==========
 */
// Coming soon. 😉
// export type DatilNetworkModule = ...;

/**
 * Union type for all possible Lit clients
 */
export type LitClient = NagaLitClient;
// | DatilLitClient;
