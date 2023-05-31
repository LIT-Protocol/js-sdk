/* eslint-disable */
export default {
  displayName: 'lit-third-party-libs',
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
  coverageDirectory: '../../coverage/packages/lit-third-party-libs',
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
