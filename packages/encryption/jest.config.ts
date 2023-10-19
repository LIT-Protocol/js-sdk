/* eslint-disable */
export default {
  displayName: 'encryption',
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
  coverageDirectory: '../../coverage/packages/encryption',
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
