/* eslint-disable */
export default {
  displayName: 'sev-snp-utils-sdk',
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
  coverageDirectory: '../../coverage/packages/sev-snp-utils-sdk',
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
