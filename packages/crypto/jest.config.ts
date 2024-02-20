/* eslint-disable */
export default {
  displayName: 'crypto',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]s$': [
      'esbuild-jest-transform',
      {
        ...require('../../ng/esbuild.config.cjs'),
        platform: 'node',
        outbase: 'src', // Needed for inline snapshots to work
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/crypto',
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
