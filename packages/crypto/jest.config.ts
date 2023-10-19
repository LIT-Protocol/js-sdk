/* eslint-disable */
export default {
  displayName: 'crypto',
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
  coverageDirectory: '../../coverage/packages/crypto',
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
