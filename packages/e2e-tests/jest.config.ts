/* eslint-disable */
export default {
  displayName: 'e2e-tests',
  preset: 'ts-jest',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/e2e-tests',
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
