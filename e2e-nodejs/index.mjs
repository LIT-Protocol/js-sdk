// runner.mjs
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { formatNxLikeLine, greenLog } from '../tools/scripts/utils.mjs';

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

  // console.log(`\nRunning tests in "${mode}" mode...`);

  let files = getFilesFromDir(DIR).filter((file) => {
    return filesValue ? filesValue.some((value) => file.includes(value)) : true;
  });

  if (files.length <= 0) {
    console.log('❌ No files to run');
    return;
  }
  console.log();
  console.log(`${formatNxLikeLine('test:e2e:nodejs', files.length)}`);
  files.forEach((file) => {
    greenLog(`  - ${path.join(DIR, file)}`, true);
  });
  console.log();
  console.log();

  // -- async mode
  if (mode === 'async') {
    for (const file of files) {
      // console.log(`\n🚀 Running test: ${file}`);
      await import(path.join(DIR, file));
    }
  }

  if (mode === 'parallel') {
    const promises = files.map((file) => {
      return import(path.join(DIR, file));
    });
    await Promise.all(promises);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error('Error:', error);
});
