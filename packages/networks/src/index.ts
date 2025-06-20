// import { NagaDevModule } from './networks/vNaga/envs/naga-rc-naga-2025-04-04/naga-dev.module';
import type { NagaLocalModule } from './networks/vNaga';
import type { NagaDevModule } from './networks/vNaga';
import type { NagaTestModule } from './networks/vNaga';
import type { NagaStagingModule } from './networks/vNaga';

// Network modules
export {
  // nagaDev,
  // naga,
  nagaStaging,
  nagaLocal,
  nagaDev,
  nagaTest,
} from './networks/vNaga';

// Network module types
export type { NagaLocalModule } from './networks/vNaga';
export type { NagaDevModule } from './networks/vNaga';
export type { NagaTestModule } from './networks/vNaga';
export type { NagaStagingModule } from './networks/vNaga';

// All Network modules
export type LitNetworkModule =
  | NagaLocalModule
  | NagaDevModule
  | NagaTestModule
  | NagaStagingModule;
// | NagaProdModule
// | NagaLocalModule
// | DatilDevModule
// | DatilTestModule
// | DatilProdModule
// | DatilLocalModule

// ----- types
export type { ConnectionInfo } from './networks/vNaga/LitChainClient/types';
export type { PKPStorageProvider } from './storage/types';

// Schema types
export type { MintRequestRaw } from './networks/vNaga/LitChainClient/schemas/MintRequestSchema';
