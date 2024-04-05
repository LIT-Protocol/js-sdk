import type { BuildOptions } from 'esbuild';
import type { Config } from 'jest';

const config: Config = {
  displayName: '@lit-protocol/wasm-internal',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'html'],
  transform: {
    '^.+\\.ts$': [
      'esbuild-jest-transform',
      {
        platform: 'node',
        loader: {
          '.wasm': 'binary',
        },
        logOverride: {
          'empty-import-meta': 'silent',
        },
      } satisfies BuildOptions,
    ],
  },
  cache: false, // using a builder does not play nice with the cache
};

export default config;
