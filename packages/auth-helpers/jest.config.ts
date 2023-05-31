/* eslint-disable */
export default {
  displayName: 'auth-helpers',
  preset: 'ts-jest',
  globals: {},
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/auth-helpers',
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
