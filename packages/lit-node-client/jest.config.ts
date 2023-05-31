/* eslint-disable */
export default {
  displayName: 'lit-node-client',
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
  coverageDirectory: '../../coverage/packages/lit-node-client',
  moduleNameMapper: {
    '^ipfs-unixfs-importer':
      'node_modules/ipfs-unixfs-importer/dist/index.min.js',
    '^blockstore-core': 'node_modules/blockstore-core/dist/index.min.js',
  },
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
