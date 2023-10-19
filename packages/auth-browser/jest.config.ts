/* eslint-disable */
export default {
  displayName: 'auth-browser',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': [
      'babel-jest',
      {
        cwd: '/Users/anson/Projects/js-sdk-master/packages/auth-browser',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!(@walletconnect)/)'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/auth-browser',
  setupFilesAfterEnv: ['../../jest.setup.js'],
  /* TODO: Update to latest Jest snapshotFormat
   * By default Nx has kept the older style of Jest Snapshot formats
   * to prevent breaking of any existing tests with snapshots.
   * It's recommend you update to the latest format.
   * You can do this by removing snapshotFormat property
   * and running tests with --update-snapshot flag.
   * Example: From within the project directory, run "nx test --update-snapshot"
   * More info: https://jestjs.io/docs/upgrading-to-jest29#snapshot-format
   */
  snapshotFormat: { escapeString: true, printBasicPrototype: true },
};
