/* eslint-disable */
export default {
  displayName: 'wrapped-keys',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[t]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/wrapped-keys',
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
