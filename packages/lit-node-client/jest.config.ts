/* eslint-disable */
export default {
  displayName: 'lit-node-client',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/lit-node-client',
  moduleNameMapper: {
    '^ipfs-unixfs-importer':
      'node_modules/ipfs-unixfs-importer/dist/index.min.js',
    '^blockstore-core': 'node_modules/blockstore-core/dist/index.min.js',
  },
};
