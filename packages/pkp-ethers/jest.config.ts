/* eslint-disable */
export default {
  displayName: 'pkp-ethers',
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
  coverageDirectory: '../../coverage/packages/pkp-ethers',
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
