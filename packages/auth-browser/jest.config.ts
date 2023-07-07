/* eslint-disable */
export default {
  displayName: 'auth-browser',
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!(@walletconnect)/)'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/auth-browser',
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
