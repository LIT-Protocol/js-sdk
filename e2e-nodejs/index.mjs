// runner.mjs
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../');
const DIR = ROOT_DIR + '/e2e-nodejs/';
const IGNORE_LIST = ['index.mjs'];

/**
 * Function to get all files from the directory excluding 'index'
 * @param {string} dir - The directory path
 * @returns {Array} - An array of file names
 */
const getFilesFromDir = (dir) => {
  return fs.readdirSync(dir).filter((file) => !IGNORE_LIST.includes(file));
};

async function main() {
  const mode = process.argv.includes('--parallel') ? 'parallel' : 'async';
  const args = process.argv.slice(2);
  const filesArg = args.find((arg) => arg.startsWith('--filter'));
  let filesValue = filesArg ? filesArg.split('=')[1] : null;
  filesValue = filesValue ? filesValue.split(',') : null;

  console.log(`🚀 Running tests in "${mode}" mode...`);

  let files = getFilesFromDir(DIR).filter((file) => {
    return filesValue ? filesValue.some((value) => file.includes(value)) : true;
  });

  if (files.length <= 0) {
    console.log('❌ No files to run');
    return;
  }

  // -- async mode
  if (mode === 'async') {
    for (const file of files) {
      await import(path.join(DIR, file));
    }
  } else {
    // -- parallel mode
  }

  process.exit(0);
}

main().catch((error) => {
  console.error('Error:', error);
});
