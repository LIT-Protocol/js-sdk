/* eslint-disable */
export default {
  displayName: 'misc-browser',
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
  coverageDirectory: '../../coverage/packages/misc-browser',
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
