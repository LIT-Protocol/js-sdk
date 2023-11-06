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
};
