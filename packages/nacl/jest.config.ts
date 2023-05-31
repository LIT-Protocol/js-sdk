/* eslint-disable */
export default {
  displayName: 'nacl',
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
  coverageDirectory: '../../coverage/packages/nacl',
};
