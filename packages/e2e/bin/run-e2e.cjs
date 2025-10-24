#!/usr/bin/env node

/**
 * CLI for @lit-protocol/e2e.
 *
 *  - `lit-e2e` runs the bundled suite with zero local config.
 *  - `lit-e2e --patterns <glob,glob>` adds extra specs on the fly.
 *  - `lit-e2e init` scaffolds `jest.e2e.local.cjs` and `babel.config.cjs`
 *    so teams can hand-roll their own Jest entry-points if they prefer.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { run } = require('jest');

const PACKAGE_ROOT = path.resolve(__dirname, '..');
const WRAPPER_PATH = path.join(__dirname, 'jest.export-wrapper.cjs');
const BABEL_CONFIG_SRC = path.join(PACKAGE_ROOT, 'babel.config.cjs');

const HELP_TEXT = `
Usage: lit-e2e [options] [-- <jest-args>]

Options:
  --patterns, -p <glob[,glob]>   Run additional specs (globs resolved from cwd)
  init                           Scaffold jest.e2e.local.cjs & babel.config.cjs
  --help, -h                     Show this help message

Examples:
  lit-e2e --runInBand
  lit-e2e --patterns qa-epoch.spec.ts -- --runInBand
  lit-e2e init
`.trim();

function printHelp() {
  console.log(HELP_TEXT);
}

/**
 * Parse CLI arguments.
 */
function parseArgs(argv) {
  if (argv.includes('init')) {
    return { mode: 'init' };
  }
  if (argv.includes('--help') || argv.includes('-h')) {
    return { mode: 'help' };
  }

  const patterns = [];
  const passThrough = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--patterns' || arg === '-p') {
      const value = argv[i + 1];
      if (!value) {
        throw new Error('Missing value for --patterns');
      }
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => patterns.push(item));
      i += 1;
      continue;
    }
    passThrough.push(arg);
  }

  return { mode: 'run', patterns, passThrough };
}

/**
 * Normalise extra test patterns.
 */
function normalisePatterns(patterns) {
  return patterns.map((pattern) => {
    const absolute = path.isAbsolute(pattern)
      ? pattern
      : path.resolve(process.cwd(), pattern);
    return absolute.replace(/\\/g, '/');
  });
}

/**
 * Create a temporary Jest config that extends the bundled wrapper.
 */
function writeTemporaryConfig(extraPatterns) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lit-e2e-'));
  const configPath = path.join(tmpDir, 'jest.config.cjs');
  const source = `
const path = require('path');
const baseConfig = require(${JSON.stringify(WRAPPER_PATH)});
const extra = ${JSON.stringify(extraPatterns)};

module.exports = {
  ...baseConfig,
  testMatch: baseConfig.testMatch.concat(extra),
};
`;
  fs.writeFileSync(configPath, source);
  return { tmpDir, configPath };
}

function cleanupTemporaryDir(tmpDir) {
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (error) {
    // Non fatal
  }
}

/**
 * Scaffold local wrapper/babel config.
 */
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

/**
 * Run Jest using the temporary config.
 */
async function runSuite(patterns, passThrough) {
  const normalised = normalisePatterns(patterns);
  const configHandle = writeTemporaryConfig(normalised);

  try {
    const jestArgs = ['--config', configHandle.configPath, ...passThrough];
    await run(jestArgs);
  } finally {
    cleanupTemporaryDir(configHandle.tmpDir);
  }
}

(async () => {
  let parsed;
  try {
    parsed = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`❌ ${error.message || error}`);
    printHelp();
    process.exit(1);
  }

  if (parsed.mode === 'help') {
    printHelp();
    return;
  }

  if (parsed.mode === 'init') {
    createLocalWrapper();
    return;
  }

  try {
    await runSuite(parsed.patterns, parsed.passThrough);
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
  }
})();
