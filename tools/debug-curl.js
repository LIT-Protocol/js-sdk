#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('node:fs');
const path = require('node:path');

function getDebugDir() {
  const envDir = process.env.LIT_DEBUG_CURL_DIR;
  const debugDir =
    typeof envDir === 'string' && envDir.trim().length > 0
      ? envDir.trim()
      : 'debug';
  return path.isAbsolute(debugDir) ? debugDir : path.join(process.cwd(), debugDir);
}

function usage() {
  console.error('Usage: pnpm debug:curl -- <X-Request-Id>');
  console.error('  Env: LIT_DEBUG_CURL_DIR=./debug (optional)');
}

function readFileIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8');
}

function main() {
  const requestId = process.argv[2];
  if (!requestId) {
    usage();
    process.exit(1);
  }

  const debugDir = getDebugDir();
  if (!fs.existsSync(debugDir)) {
    console.error(`Debug dir not found: ${debugDir}`);
    process.exit(2);
  }

  const exactPath = path.join(debugDir, requestId);
  const exact = readFileIfExists(exactPath);
  if (exact !== null) {
    process.stdout.write(exact);
    return;
  }

  const matches = fs
    .readdirSync(debugDir)
    .filter((name) => name.includes(requestId))
    .sort();

  if (matches.length === 0) {
    console.error(`Not found: ${exactPath}`);
    process.exit(3);
  }

  if (matches.length === 1) {
    const matchPath = path.join(debugDir, matches[0]);
    const content = readFileIfExists(matchPath);
    if (content === null) {
      console.error(`Not found: ${matchPath}`);
      process.exit(4);
    }
    process.stdout.write(content);
    return;
  }

  console.error(`Multiple matches in ${debugDir}:`);
  for (const name of matches) {
    console.error(`- ${name}`);
  }
  process.exit(5);
}

main();

