/* eslint-disable */
export default {
  displayName: 'contracts-sdk',
  preset: '../../jest.preset.js',
  globals: {},
  transform: {
    '^.+\\.[t]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/contracts-sdk',
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
