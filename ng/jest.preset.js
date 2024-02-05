const nxPreset = require('@nx/jest/preset').default;

/** @type {import('jest').Config} */
const preset = {
  ...nxPreset,
  transform: {
    '^.+\\.[tj]s$': [
      'esbuild-jest-transform',
      require('./esbuild.config.cjs'),
    ],
  },
};

module.exports = preset;
