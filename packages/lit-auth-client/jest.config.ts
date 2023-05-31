/* eslint-disable */
export default {
  displayName: 'lit-auth-client',
  preset: '../../jest.preset.js',
  globals: {},
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/lit-auth-client',
  transformIgnorePatterns: ['/node_modules/(?!(@simplewebauthn|nanoid)/)'],
};
