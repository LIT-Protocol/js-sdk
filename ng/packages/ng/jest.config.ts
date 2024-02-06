import type { Config } from 'jest';

const config: Config = {
  displayName: '@lit-protocol/ng',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/ng',
  cache: false,
};

export default config;
