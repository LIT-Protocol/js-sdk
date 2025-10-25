#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PACKAGE_ROOT = path.resolve(__dirname, '..');
const WRAPPER_PATH = path.join(__dirname, 'jest.export-wrapper.cjs');
const BABEL_CONFIG_SRC = path.join(PACKAGE_ROOT, 'babel.config.cjs');

function createLocalWrapper() {
  const cwd = process.cwd();
  const jestDest = path.join(cwd, 'jest.e2e.local.cjs');
  const babelDest = path.join(cwd, 'babel.config.cjs');

  if (!fs.existsSync(jestDest)) {
    fs.copyFileSync(WRAPPER_PATH, jestDest);
    console.log(`✅ Created ${path.relative(cwd, jestDest)}`);
  } else {
    console.warn(`⚠️ ${path.relative(cwd, jestDest)} already exists, skipping`);
  }

  if (!fs.existsSync(babelDest)) {
    fs.copyFileSync(BABEL_CONFIG_SRC, babelDest);
    console.log(`✅ Created ${path.relative(cwd, babelDest)}`);
  } else {
    console.warn(`⚠️ ${path.relative(cwd, babelDest)} already exists, skipping`);
  }

  console.log('✨ Local scaffolding complete. Point Jest at jest.e2e.local.cjs to run from this project.');
}

const [, , command] = process.argv;

if (command === 'init') {
  createLocalWrapper();
} else {
  console.log('Usage: lit-e2e init');
  process.exit(command ? 1 : 0);
}
