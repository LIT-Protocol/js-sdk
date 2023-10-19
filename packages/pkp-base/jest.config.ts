/* eslint-disable */
export default {
  displayName: 'pkp-base',
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
  coverageDirectory: '../../coverage/packages/pkp-base',
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
