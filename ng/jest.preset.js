const nxPreset = require('@nx/jest/preset').default;

/** @type {import('jest').Config} */
const preset = {
  ...nxPreset,
  transform: {
    // '^.+\\.[tj]s$': ['ts-jest', {}],
    '^.+\\.[tj]s$': [
      'esbuild-jest-transform',
      {
        ...require('./esbuild.config.cjs'),
        platform: 'node',
        outbase: 'src', // Needed for inline snapshots to work
      },
    ],
  },
};

module.exports = preset;
