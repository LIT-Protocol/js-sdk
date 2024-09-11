/** @type {import('jest').Config} */
const config = {
  displayName: 'e2e-tests',
  preset: 'ts-jest',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  passWithNoTests: true,
  runInBand: true,
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/e2e-tests',
  setupFilesAfterEnv: ['../../jest.setup.js'],
  testEnvironment: './setup.config.js',
  globalSetup: './setup.jest.js',
  globalTeardown: './teardown.jest.js',
  testPathIgnorePatterns: [
    './src/tests/Epoch',
    './src/tests/WrappedKeys',
    './src/tests/Relayer',
    './src/tests/Delegation',
  ],
};

//@ts-expect-error module type exists
module.exports = config;
