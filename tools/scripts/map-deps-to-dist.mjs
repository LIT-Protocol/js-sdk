// # Usage: node tools/scripts/map-deps-to-dist <path-to-packages-dir> <path-to-dist-dir>
// # Example Usage: node tools/scripts/map-deps-to-dist packages dist/packages
import { exit } from 'process';
import {
  findImportsFromDir,
  getArgs,
  redLog,
  listDirsRecursive,
  asyncForEach,
  greenLog,
  readJsonFile,
  writeJsonFile,
  question,
} from './utils.mjs';

const args = getArgs();

if (args[0] === '--help') {
  redLog(
    '# Usage: node tools/scripts/map-deps-to-dist <path-to-packages-dir> <path-to-dist-dir> <filter>'
  );
  exit();
}

const PACKAGES_DIR = args[0];
const DIST_DIR = args[1];
const FILTER = args[2];

if (!PACKAGES_DIR || !DIST_DIR || !FILTER) {
  redLog(
    'Missing arguments <path-to-packages-dir> <path-to-dist-dir> <filter>'
  );
  exit();
}

const packagesDir = await listDirsRecursive(PACKAGES_DIR, false);

await asyncForEach(packagesDir, async (packageDir) => {
  const packageInsideDirs = await listDirsRecursive(packageDir);
  let imports = [];

  await asyncForEach(packageInsideDirs, async (insideDir) => {
    let imported = await findImportsFromDir(insideDir);

    imported = imported.filter((item) => item.includes(FILTER));
    imports.push(imported);
  });

  const dependencies = [...new Set(imports.flat())];

  // Add peerDependencies to dependencies
  const packageJsonPath = DIST_DIR + '/' + packageDir + '/package.json';

  const packageJson = await readJsonFile(packageJsonPath);

  // await asyncForEach((dependencies), async (dep) => {
  //     packageJson.dependencies[dep] = packageJson.version;
  // })

  packageJson.dependencies = {
    ...packageJson.dependencies,
    ...packageJson.peerDependencies,
  };

  await writeJsonFile(packageJsonPath, packageJson);

  greenLog(`Added ${dependencies.length} dependencies to ${packageJsonPath}`);
});

exit();
