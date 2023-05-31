/* eslint-disable */
export default {
  displayName: 'pkp-ethers',
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
  coverageDirectory: '../../coverage/packages/pkp-ethers',
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
