/* eslint-disable */
export default {
  displayName: 'pkp-auth-service',
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
  coverageDirectory: '../../coverage/packages/pkp-auth-service',
  setupFilesAfterEnv: ['../../jest.setup.js'],
  testEnvironment: 'node',
}; 