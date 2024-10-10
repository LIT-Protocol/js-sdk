/** @type {import('jest').Config} */
const config = {
  displayName: 'e2e-tests',
  preset: 'ts-jest',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/e2e-tests',
  setupFilesAfterEnv: ['../../jest.setup.js'],
  testEnvironment: './setup.config.js',
  globalSetup: './setup.jest.js',
  globalTeardown: './teardown.jest.js',
};

module.exports = config;
