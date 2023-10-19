/* eslint-disable */
export default {
  displayName: 'pkp-cosmos',
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
  coverageDirectory: '../../coverage/packages/pkp-cosmos',
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
