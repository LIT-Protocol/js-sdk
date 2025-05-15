import { NagaDevModule } from './src/networks/vNaga/envs/naga-dev/naga-dev.module';

// export { nagaLocal } from './src/networks/vNaga/envs/naga-local';
export { nagaDev } from './src/networks/vNaga/envs/naga-dev';
// export { nagaTest } from './src/networks/vNaga/envs/naga-test';
// export { nagaProd } from './src/networks/vNaga/envs/naga-prod';

// ----- types
// export type { LitNetworkModule } from './src/networks/LitNetworkModule.bak';
export type { NagaDevModule } from './src/networks/vNaga/envs/naga-dev/naga-dev.module';
export type { ConnectionInfo } from './src/networks/vNaga/LitChainClient/types';
export type LitNetworkModule = NagaDevModule;
// | NagaTestModule
// | NagaProdModule
// | NagaLocalModule
// | DatilDevModule
// | DatilTestModule
// | DatilProdModule
// | DatilLocalModule

import * as litConstants from '@lit-protocol/constants';
