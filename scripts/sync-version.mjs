#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Anchor paths relative to repo root so the script works from any cwd.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..');

// Matches the exported version constant in packages/constants/src/lib/version.ts.
const VERSION_EXPORT_PATTERN = /export const version = ['"]([^'\"]+)['"];?/;

async function main() {
  const litClientPackageJsonPath = resolve(
    repoRoot,
    'packages',
    'lit-client',
    'package.json'
  );
  const versionFilePath = resolve(
    repoRoot,
    'packages',
    'constants',
    'src',
    'lib',
    'version.ts'
  );

  let litClientPackageJson;
  try {
    litClientPackageJson = JSON.parse(
      await readFile(litClientPackageJsonPath, 'utf8')
    );
  } catch (err) {
    throw new Error(
      `Failed to read or parse package.json at ${litClientPackageJsonPath}: ${err.message}`
    );
  }
  const litClientVersion = litClientPackageJson.version;

  if (!litClientVersion) {
    throw new Error(`Version not found in ${litClientPackageJsonPath}`);
  }

  let versionFileContents;
  try {
    versionFileContents = await readFile(versionFilePath, 'utf8');
  } catch (err) {
    throw new Error(
      `Failed to read version file at ${versionFilePath}: ${err.message}`
    );
  }
  const match = versionFileContents.match(VERSION_EXPORT_PATTERN);

  if (!match) {
    throw new Error(
      `Could not find exported version constant in ${versionFilePath}`
    );
  }

  const currentVersion = match[1];

  if (currentVersion === litClientVersion) {
    console.log(`version.ts already in sync (${currentVersion})`);
    return;
  }

  // Rewrite the version export so it mirrors the lit-client package version.
  const updatedContents = versionFileContents.replace(
    VERSION_EXPORT_PATTERN,
    `export const version = '${litClientVersion}';`
  );

  await writeFile(versionFilePath, updatedContents);
  console.log(`Updated version.ts to ${litClientVersion}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
