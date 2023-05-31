/* eslint-disable */
export default {
  displayName: 'pkp-walletconnect',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[t]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/pkp-walletconnect',
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
