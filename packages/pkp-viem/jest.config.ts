/* eslint-disable */
export default {
  displayName: 'pkp-viem',
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
  coverageDirectory: '../../coverage/packages/pkp-viem',
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
