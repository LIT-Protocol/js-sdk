/* eslint-disable */
export default {
  displayName: 'lit-node-client-nodejs',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/lit-node-client-nodejs',
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
