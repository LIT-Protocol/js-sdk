/**
 * Packaged Jest configuration for consumers of @lit-protocol/e2e.
 * Resolves the compiled spec shipped with the package and keeps transforms open
 * in case additional TypeScript-based specs are provided by QA teams.
 */
const config = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx|js|mjs)$': 'babel-jest',
  },
  transformIgnorePatterns: [],
  testMatch: ['**/node_modules/@lit-protocol/e2e/dist/specs/**/*.spec.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'mjs', 'cjs', 'json'],
};

module.exports = config;
