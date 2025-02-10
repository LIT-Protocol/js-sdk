/* eslint-disable */
export default {
  displayName: 'lit-auth',
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
  coverageDirectory: '../../coverage/packages/lit-auth',
  moduleNameMapper: {
    '^ipfs-unixfs-importer':
      'node_modules/ipfs-unixfs-importer/dist/index.min.js',
    '^blockstore-core': 'node_modules/blockstore-core/dist/index.min.js',
  },
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
