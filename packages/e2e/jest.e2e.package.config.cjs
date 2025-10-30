/**
 * Packaged Jest configuration for consumers of @lit-protocol/e2e.
 * Resolves the bundled specs and maps helpers so QA can run the suite without
 * writing local config or Babel presets manually.
 */
const path = require('path');

const srcEntry = require.resolve('@lit-protocol/e2e');
const srcDir = path.dirname(srcEntry);
const packageRoot = path.dirname(srcDir);
module.exports = {
  testEnvironment: 'node',
  rootDir: packageRoot,
  roots: [packageRoot],
  testMatch: ['<rootDir>/specs/**/*.spec.ts'],
  transform: {
    '^.+\\.(ts|tsx|js|mjs)$': 'babel-jest',
  },
  transformIgnorePatterns: [],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'mjs', 'cjs', 'json'],
  testPathIgnorePatterns: [],
  moduleNameMapper: {
    '^@lit-protocol/e2e/(.*)$': path.join(srcDir, '$1'),
    '^@lit-protocol/e2e$': path.join(srcDir, 'index.js'),
  },
};
