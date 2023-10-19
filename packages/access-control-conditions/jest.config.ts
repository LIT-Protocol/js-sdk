/* eslint-disable */
export default {
  displayName: 'access-control-conditions',
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
  coverageDirectory: '../../coverage/packages/access-control-conditions',
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
