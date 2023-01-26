/* eslint-disable */
export default {
  displayName: 'auth-browser',
  preset: '../../jest.preset.js',

  transform: {
    '^.+\\.[tj]s$': ['babel-jest', { cwd: __dirname }],
  },
  transformIgnorePatterns: ['node_modules/(?!(@walletconnect)/)'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/auth-browser',
};
