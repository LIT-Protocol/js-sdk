// import { NagaDevModule } from './networks/vNaga/envs/naga-rc-naga-2025-04-04/naga-dev.module';
import type { NagaLocalModule } from './networks/vNaga';

// Network modules
export {
  // nagaDev,
  // nagaTest,
  // naga,
  nagaLocal,
} from './networks/vNaga';

// Network module types
export type { NagaLocalModule } from './networks/vNaga';

// All Network modules
export type LitNetworkModule = NagaLocalModule;
// | NagaDevModule;
// | NagaTestModule
// | NagaProdModule
// | NagaLocalModule
// | DatilDevModule
// | DatilTestModule
// | DatilProdModule
// | DatilLocalModule

// ----- types
export type { ConnectionInfo } from './networks/vNaga/LitChainClient/types';
export type { PKPStorageProvider } from './storage/types';
