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
  console.log(`  
  💡 Usage: yarn test:e2e:node
  
  🌍 ENVs:
      DEBUG=true yarn test:e2e:node (Enables debug mode)
      REAL_TX=true yarn test:e2e:node (Enables real tx that costs gas)

  🚩 Flags:
      --filter=<keyword> (Filters files by keyword)
      --group=<group> (Group is directory prefix, e.g., --group=pkp-ethers uses group-pkp-ethers)`);

  const mode = process.argv.includes('--parallel') ? 'parallel' : 'async';
  const args = process.argv.slice(2);
  const filesArg = args.find((arg) => arg.startsWith('--filter'));
  const groupArg = args.find((arg) => arg.startsWith('--group'));
  let filesValue = filesArg ? filesArg.split('=')[1] : null;
  let groupValue = groupArg ? groupArg.split('=')[1] : null;
  filesValue = filesValue ? filesValue.split(',') : null;

  let files = getFilesFromDir(DIR).filter((file) => {
    return filesValue ? filesValue.some((value) => file.includes(value)) : true;
  });

  if (groupValue) {
    files = files.filter((file) => file.includes(`group-${groupValue}`));
  }

  if (files.length <= 0) {
    console.log('❌ No files to run');
    return;
  }

  console.log();
  console.log(`${formatNxLikeLine('test:e2e:node', files.length)}`);
  files.forEach((file) => {
    greenLog(`  - ${file}`, true);
  });

  console.log(
    '\n  --------------------------------------------------------------------------------'
  );

  if (groupValue) {
    console.log(`\n🚀 Running tests in group: ${groupValue}`);
  }
  let currentGroup = null;
  let errorCounter = 0;

  // -- async mode
  if (mode === 'async') {
    for (const file of files) {
      const group = file.split('/')[file.split('/').length - 2]; // Assuming group is the second last part of the file path

      if (group !== currentGroup) {
        console.log(`\nRunning tests in ${group}`);
        currentGroup = group;
      }

      try {
        await import(file);
      } catch (e) {
        errorCounter += 1;
        console.log(e);
      }
    }
  }

  if (mode === 'parallel') {
    const promises = files.map(async (file) => {
      const group = file.split('/')[file.split('/').length - 2];

      if (group !== currentGroup) {
        console.log(`\nRunning tests in ${group}`);
        currentGroup = group;
      }

      await import(file);
    });

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Parallel Execution Error:', error);
    }
  }

  console.log();

  if (errorCounter > 0) {
    console.log(`❌ ${errorCounter} test(s) failed`);
    process.exit(1);
  }
  process.exit(0);
}

main().catch((error) => {
  console.error('Error:', error);
});
