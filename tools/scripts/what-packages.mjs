/**
 * EMS Function to Recursively Search for Imports by a Given String
 *
 * Usage Example:
 * ```javascript
 * import { findImports } from './path-to-this-file.mjs';
 *
 * const searchString = '@lit-protocol';
 * const pathToSearch = './src';
 *
 * const results = findImports(searchString, pathToSearch);
 * console.log(results);  // ['@lit-protocol/lit-storage', '@lit-protocol/lit-auth-client']
 * ```
 */

// what-packages.mjs

import { promises as fs } from 'fs';
import path from 'path';

async function findImports(targetString, searchPath) {
  const allFiles = await listFilesRecursive(searchPath);
  const targetFiles = allFiles.filter((file) => file.endsWith('.ts'));

  const matches = new Set();

  for (const file of targetFiles) {
    const content = await fs.readFile(file, 'utf-8');
    const regex = new RegExp(`from ['"](${targetString}[^'"]+)['"]`, 'g');
    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.add(match[1]);
    }
  }

  return [...matches];
}

async function listFilesRecursive(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? listFilesRecursive(res) : res;
    })
  );
  return Array.prototype.concat(...files);
}

const args = process.argv.slice(2);
const searchString = args[0] || '@lit-protocol';
const searchPath = args[1] || './src';

const results = await findImports(searchString, searchPath);

console.log('Results:', results);

console.log(`"peerDependencies": {`);
results.forEach((dep, index) => {
  console.log(
    `   "${dep}": "*"${index === results.length - 1 ? '' : ','}`
  );
});
console.log(`}`);
