/* eslint-disable */
export default {
  displayName: 'uint8arrays',
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
  coverageDirectory: '../../coverage/packages/uint8arrays',
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
