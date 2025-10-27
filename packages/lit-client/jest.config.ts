/* eslint-disable */
export default {
  displayName: 'lit-client',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[t]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/lit-client',
  setupFilesAfterEnv: ['../../jest.setup.js'],
  testEnvironment: 'node',
};
