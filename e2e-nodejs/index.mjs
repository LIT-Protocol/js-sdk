// runner.mjs
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { formatNxLikeLine, greenLog } from '../tools/scripts/utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../');
const DIR = ROOT_DIR + '/e2e-nodejs/';
const IGNORE_LIST = ['index.mjs', 'template.mjs', '00-setup.mjs'];

/**
 * Function to get all files from the directory excluding 'index'
 * @param {string} dir - The directory path
 * @returns {Array} - An array of file names
 */
const getFilesFromDir = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      /* Recurse into a subdirectory */
      results = results.concat(getFilesFromDir(filePath));
    } else {
      /* Is a file */
      results.push(filePath);
    }
  });

  return results.filter((file) => {
    if (IGNORE_LIST.includes(path.basename(file))) {
      return false;
    }
    return true;
  });
};

async function main() {
  const mode = process.argv.includes('--parallel') ? 'parallel' : 'async';
  const args = process.argv.slice(2);
  const filesArg = args.find((arg) => arg.startsWith('--filter'));
  const groupArg = args.find((arg) => arg.startsWith('--group'));
  let filesValue = filesArg ? filesArg.split('=')[1] : null;
  let groupValue = groupArg ? groupArg.split('=')[1] : null;
  filesValue = filesValue ? filesValue.split(',') : null;

  // console.log(`\nRunning tests in "${mode}" mode...`);

  let files = getFilesFromDir(DIR).filter((file) => {
    return filesValue ? filesValue.some((value) => file.includes(value)) : true;
  });

  // console.log(files);

  // process.exit();

  if (groupValue) {
    files = files.filter((file) => file.includes(`group-${groupValue}`));
  }

  if (files.length <= 0) {
    console.log('❌ No files to run');
    return;
  }
  console.log();
  console.log(`${formatNxLikeLine('test:e2e:nodejs', files.length)}`);
  files.forEach((file) => {
    greenLog(`  - ${file}`, true);
  });

  console.log();

  if (groupValue) {
    console.log(`\n🚀 Running tests in group: ${groupValue}`);
  }

  // -- async mode
  if (mode === 'async') {
    for (const file of files) {
      // console.log(`\n🚀 Running test: ${file}`);
      await import(file);
    }
  }

  if (mode === 'parallel') {
    const promises = files.map((file) => {
      return import(file);
    });
    await Promise.all(promises);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error('Error:', error);
});
