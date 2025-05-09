import { networkConfig } from './naga-dev.config';
import { NagaDevOperations } from './naga-dev.module';

export const nagaDev = {
  config: networkConfig,
  operations: NagaDevOperations,
};
