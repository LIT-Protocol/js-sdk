/* eslint-disable */
export default {
  displayName: 'ecdsa-sdk',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/ecdsa-sdk',
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
