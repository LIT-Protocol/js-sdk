// bump-getlit-sdk.mjs
import fs from 'fs';
import path from 'path';
import semver from 'semver';

const filePath = path.join(
  process.cwd(),
  'packages/getlit-sdk/src/lib/utils.ts'
);

// Read the file
let file = fs.readFileSync(filePath, 'utf8');

// Extract the version number using a regular expression
const versionMatch = file.match(/version = '(.+?)'/);
if (!versionMatch) {
  console.error('Could not find version in utils.ts');
  process.exit(1);
}

const oldVersion = versionMatch[1];
const newVersion = semver.inc(oldVersion, 'patch');
if (!newVersion) {
  console.error('Could not increment version');
  process.exit(1);
}

// Replace the version in the file
file = file.replace(`version = '${oldVersion}'`, `version = '${newVersion}'`);

// Write the updated file
fs.writeFileSync(filePath, file, 'utf8');

console.log(`Bumped version from ${oldVersion} to ${newVersion}`);
