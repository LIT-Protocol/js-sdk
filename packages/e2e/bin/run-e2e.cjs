#!/usr/bin/env node

/**
 * Lightweight CLI wrapper that runs Jest with the packaged E2E configuration.
 * Consumers can still override CLI flags; the bundled config is injected unless
 * `--config` is already provided.
 */
const path = require('path');

let runJest;
try {
  runJest = require('jest').run;
} catch (error) {
  console.error('❌ Unable to locate Jest. Please install it in your project (e.g. `pnpm add -D jest`).');
  process.exit(1);
}

const defaultConfig = path.join(__dirname, '..', 'jest.e2e.package.config.cjs');

const argv = process.argv.slice(2);
const hasConfigFlag = argv.some((arg) => arg === '--config' || arg.startsWith('--config='));

if (!hasConfigFlag) {
  argv.unshift('--config', defaultConfig);
}

runJest(argv);
