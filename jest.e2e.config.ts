import type { Config } from 'jest';

// only map local packages (prevent hijacking external `@lit-protocol/*` packages)
const localPackages = [
  'access-control-conditions',
  'access-control-conditions-schemas',
  'auth',
  'auth-helpers',
  'auth-services',
  'constants',
  'crypto',
  'lit-client',
  'logger',
  'networks',
  'schemas',
  'types',
  'wasm',
  'e2e',
  'wrapped-keys',
  'wrapped-keys-lit-actions',
];

const useVmModules = process.env['NODE_OPTIONS']?.includes(
  '--experimental-vm-modules'
);
const transformIgnorePatterns = useVmModules
  ? [
      '/node_modules/(?:\\.pnpm/[^/]+/node_modules/)?@lit-protocol/lit-status-sdk/',
    ]
  : [];

const config: Config = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/packages/e2e/src/**/*.spec.ts'],

  // Use Babel for everything; simple and robust with TS + ESM
  transform: {
    '^.+\\.(ts|tsx|js|mjs)$': 'babel-jest',
  },

  // Allow transforms for node_modules so ESM deps work
  transformIgnorePatterns,

  // Resolve monorepo packages to sources
  moduleNameMapper: {
    '^@lit-protocol/contracts/custom-network-signatures$':
      '<rootDir>/packages/contracts/dist/custom-network-signatures.cjs',
    '^@lit-protocol/contracts$': '<rootDir>/packages/contracts/dist/index.cjs',
    '^@lit-protocol/contracts/(.*)$':
      '<rootDir>/packages/contracts/dist/$1.cjs',
    // Local packages
    [`^@lit-protocol/(${localPackages.join('|')})/lib/(.*)$`]:
      '<rootDir>/packages/$1/src/lib/$2',
    [`^@lit-protocol/(${localPackages.join('|')})(/.*)?$`]:
      '<rootDir>/packages/$1/src$2',
    '^@wagmi/core$': '<rootDir>/packages/e2e/src/testing/wagmi-core.ts',
  },

  // this is to avoid duplicate module resolution errors
  // eg.
  // jest-haste-map: Haste module naming collision: @lit-protocol/crypto
  // The following files share their name; please adjust your hasteImpl:
  //   * <rootDir>/packages/crypto/package.json
  //   * <rootDir>/.nx/cache/10833129804332267556/outputs/dist/packages/crypto/package.json
  // FAIL  e2e/src/e2e.spec.ts
  // ● Test suite failed to run
  //   The name `@lit-protocol/auth` was looked up in the Haste module map. It cannot be resolved, because there exists several different files, or packages, that provide a module for that particular name and platform. The platform is generic (no extension). You must delete or exclude files until there remains only one of these:
  modulePathIgnorePatterns: ['<rootDir>/.nx/', '<rootDir>/dist/'],
};

export default config;
