/* eslint-disable */
export default {
  displayName: 'access-control-conditions-schemas',
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
  coverageDirectory:
    '../../coverage/packages/access-control-conditions-schemas',
  setupFilesAfterEnv: ['../../jest.setup.js'],
};
