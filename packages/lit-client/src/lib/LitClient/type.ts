// import type { NagaDevModule20250404 } from '@lit-protocol/networks';
import {
  NagaLocalModule,
  NagaDevModule,
  NagaMainnetModule,
  NagaStagingModule,
} from '@lit-protocol/networks';
import type {
  NagaLitClient,
  NagaLitClientContext,
} from './types/NagaLitClient.type';

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
  | NagaStagingModule
  | NagaMainnetModule;

/**
 * ========== (v7) All Datil Network Modules ==========
 */
// Coming soon. 😉
// export type DatilNetworkModule = ...;

/**
 * Union type for all possible Lit clients
 */
export type LitClient = NagaLitClient;
export type LitClientContext = NagaLitClientContext;
