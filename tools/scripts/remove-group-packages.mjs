// removeGroupPackages.js
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import rimraf from 'rimraf';
import { redLog } from './utils.mjs';

const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

const DIST_DIR = './dist/packages';
const GROUP_TO_DELETE = process.argv[2]; // Gets the group name from command line args

if (!GROUP_TO_DELETE) {
  redLog('No group specified, exiting...');
  process.exit(1);
}

async function checkAndDelete(group) {
  try {
    const packages = await readDir(DIST_DIR);
    for (const pkg of packages) {
      const packageDir = path.join(DIST_DIR, pkg);
      const packageJsonPath = path.join(packageDir, 'package.json');

      // If there is no package.json, skip this package
      if (!fs.existsSync(packageJsonPath)) continue;

      const packageJsonData = await readFile(packageJsonPath);
      const packageJson = JSON.parse(packageJsonData);

      // If the package's group matches the group to delete, delete the package
      if (packageJson.group === group) {
        rimraf.sync(packageDir);
        console.log(`Deleted package at: ${packageDir}`);
      }
    }
  } catch (err) {
    redLog(`Failed to delete packages in group '${group}':`, err);
  }

  process.exit();
}

// Run the function with the specified group to delete
checkAndDelete(GROUP_TO_DELETE);
