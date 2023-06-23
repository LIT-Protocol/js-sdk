/* eslint-disable */
export default {
  displayName: 'getlit-sdk',
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
  coverageDirectory: '../../coverage/packages/getlit-sdk',
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
