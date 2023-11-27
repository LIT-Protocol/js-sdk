import fs from 'fs';
import path from 'path';

import { bunSpawn, greenLog, redLog } from './utils.mjs';

/**
 * This script recursively looks for files in the directory ./packages that ends with .spec.ts or .test.ts.
 * When run with node ./tools/scripts/test-scripts.mjs <file-name-without-extension>, it runs the script with command 'bun test <path-of-the-test-file>'
 *
 * Arguments can be provided in the format "--<command>=<value>"
 *
 * Example: node ./tools/scripts/test-scripts.mjs --dir=./packages --ext=.spec.ts,.test.ts
 */

const args = process.argv.slice(2);
const TEST_DIR =
  args.find((arg) => arg.startsWith('--dir'))?.split('=')[1] || './packages';
const TEST_FILE_EXTENSIONS = args
  .find((arg) => arg.startsWith('--ext'))
  ?.split('=')[1]
  ?.split(',') || ['.spec.ts', '.test.ts'];

/**
 * Recursively find test files in the given directory
 * @param {string} dir - The directory to search in
 * @param {string[]} exts - The file extensions to look for
 * @returns {string[]} - The paths of the found test files
 */
function findTestFiles(dir, exts) {
  let testFiles = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    // Extract the extension from the file name considering the possibility of multiple dots in the file name
    const fileExtension = '.' + file.split('.').slice(1).join('.');

    if (stat.isDirectory()) {
      testFiles = testFiles.concat(findTestFiles(filePath, exts));
    } else if (exts.includes(fileExtension)) {
      testFiles.push(filePath);
    }
  }

  return testFiles;
}

/**
 * Run the test command for the given test file
 * @param {string} testFile - The path of the test file
 */
async function runTest(testFile) {
  const command = `bun test ${testFile}`;
  console.log('Running command: ', command);
  await bunSpawn(command, { stdout: 'inherit' });
}

const testFiles = findTestFiles(TEST_DIR, TEST_FILE_EXTENSIONS);

greenLog(`${testFiles.length} test files found!`, true);

const testName = process.argv[2];

if (testName) {
  const matchingTestFiles = testFiles.filter((file) => {
    return file.includes(testName);
  });

  if (!matchingTestFiles.length) {
    console.error(`No test files matching "${testName}" found.`);
    process.exit(1);
  }

  for (const filePath of matchingTestFiles) {
    await runTest(filePath);
  }
} else {
  redLog('Please provide a test name. eg. bun test:file lit-node-client');
  process.exit(1);
}

process.exit(0);
