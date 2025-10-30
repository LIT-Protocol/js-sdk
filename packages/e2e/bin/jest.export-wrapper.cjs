const path = require('path');
const baseConfig = require('@lit-protocol/e2e/jest-config');
const packageRoot = path.dirname(require.resolve('@lit-protocol/e2e'));

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  roots: Array.from(new Set([__dirname, packageRoot])),
  testMatch: [
    ...baseConfig.testMatch,
    path.join(__dirname, 'specs/**/*.spec.ts'),
    path.join(__dirname, '**/*.spec.ts'),
  ],
};
