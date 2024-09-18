/**
 * Direct link to nx presets
 * https://github.com/nrwl/nx/blob/master/packages/jest/preset/jest-preset.ts
 */
const nxPreset = require('@nx/jest/preset').default;

const presets = {
  ...nxPreset,
};

presets.testEnviorment = 'node';
