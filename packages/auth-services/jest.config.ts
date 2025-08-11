/* eslint-disable */
export default {
  displayName: 'auth-services',
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
  coverageDirectory: '../../coverage/packages/auth-services',
  setupFilesAfterEnv: ['../../jest.setup.js'],
  testEnvironment: 'node',
};
