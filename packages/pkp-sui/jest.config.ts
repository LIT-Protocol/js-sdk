/* eslint-disable */
export default {
  displayName: 'pkp-sui',
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
  coverageDirectory: '../../coverage/packages/pkp-sui',
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
