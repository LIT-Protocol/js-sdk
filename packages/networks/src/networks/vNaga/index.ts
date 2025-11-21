// Naga Local
export { nagaLocal } from './envs/naga-local';
export type {
  NagaLocal as NagaLocalModule,
  NagaLocalContextOptions,
} from './envs/naga-local/naga-local.module';

// Naga Dev
export { nagaDev } from './envs/naga-dev';
export type { NagaDevUnifiedModule as NagaDevModule } from './envs/naga-dev/naga-dev.module';

// Naga Test
export { nagaTest } from './envs/naga-test';
export type { NagaTest as NagaTestModule } from './envs/naga-test/naga-test.module';

// Naga Staging
export { nagaStaging } from './envs/naga-staging';
export type { NagaStaging as NagaStagingModule } from './envs/naga-staging/naga-staging.module';

// Naga Mainnet
export { nagaMainnet } from './envs/naga-mainnet';
export type { NagaMainnet as NagaMainnetModule } from './envs/naga-mainnet/naga-mainnet.module';

// Naga (alias for mainnet)
export { nagaMainnet as naga } from './envs/naga-mainnet';
export type { NagaMainnet as NagaModule } from './envs/naga-mainnet/naga-mainnet.module';

// Naga Proto
export { nagaProto } from './envs/naga-proto';
export type { NagaProto as NagaProtoModule } from './envs/naga-proto/naga-proto.module';
