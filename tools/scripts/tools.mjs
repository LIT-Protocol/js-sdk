import fs, { readFileSync } from 'fs';
import { exit } from 'process';
import {
  asyncForEach,
  checkEmptyDirectories,
  childRunCommand,
  getArgs,
  getFlag,
  greenLog,
  listDirsRecursive,
  prefixPathWithDir,
  readFile,
  readJsonFile,
  redLog,
  writeFile,
  writeJsonFile
} from './utils.mjs';

const args = getArgs();

const OPTION = args[0];

const optionMaps = new Map([
  ['--help', () => helpFunc()],
  ['--setup-local-dev', () => setupLocalDevFunc()],
  ['--match-versions', () => matchVersionsFunc()],
  ['default', () => helpFunc()],
  ['--verify', () => validateDependencyVersions()],
  ['fixTsConfig', () => fixTsConfigFunc()],
]);

const setup = () => {
  const result = optionMaps.get(OPTION) || optionMaps.get('default');
  result();
};

setup();

function helpFunc() {
  greenLog(
    `
        Usage: node tools/scripts/tools.mjs [option][...args]
        Options:
            --help: show this help
            --remove-local-dev: remove local dev
            --setup-local-dev: setup local dev
            --match-versions: match versions
            --verify: validate dependency versions
            fixTsConfig: fix tsconfig
            check: check for empty directories
    `,
    true
  );
  exit();
}

async function fixTsConfigFunc() {
  const TSCONFIG = JSON.parse(await readFile('tsconfig.json'));

  TSCONFIG.compilerOptions.paths = {
    '@lit-protocol/*': ['packages/*/src'],
  };

  await writeFile('tsconfig.json', JSON.stringify(TSCONFIG, null, 2));

  process.exit();
}


async function setupLocalDevFunc() {
  const PROJECT_NAME = args[1];

  if (!PROJECT_NAME || PROJECT_NAME === '' || PROJECT_NAME === '--help') {
    greenLog(
      `
              Usage: node tools/scripts/tools.mjs --setup-local-dev [options]
                  [options]:
                    --target [project]: the project to setup local dev for
              `,
      true
    );
  }

  /**
   * Setup symlink for a project eg. `packages/my-project/dist` -> `dist/packages/my-project`
   * @param {string} projectName
   * @returns {Promise<void>}
   */
  const setupSymlink = async (projectName) => {
    // First, remove existing dist symlink if exists.
    const dirPathToCreate = `packages/${projectName}/dist`;
    if (fs.existsSync(dirPathToCreate)) {
      greenLog(`Removing symlink ${dirPathToCreate} ...`);
      await childRunCommand(`rm -rf ${dirPathToCreate}`);
    }

    if(['wrapped-keys','wrapped-keys-lit-actions'].includes(projectName)) {
      greenLog(`Skipping ${projectName}`);
      return;
    }

    // Then, create a symlink of each package's `dist` folder to their corresponding
    // package directory location under the root `dist`.
    const symLinkTarget = `../../dist/packages/${projectName}`; // relative to symlink directory
    greenLog(`Creating symlink ${dirPathToCreate} -> ${symLinkTarget} ...`);
    await childRunCommand(`ln -s ${symLinkTarget} ${dirPathToCreate}`);

    // Then, update each package's `package.json` to have the same `main` and `typings` path
    // as the `package.json` in the dist, except prefixed with `dist`.
    const packageJsonPath = `packages/${projectName}/package.json`;
    const distPackageJsonPath = `dist/packages/${projectName}/package.json`;
    const packageJson = await readJsonFile(packageJsonPath);
    const distPackageJson = await readJsonFile(distPackageJsonPath);

    packageJson.main = prefixPathWithDir(distPackageJson.main, 'dist');
    packageJson.typings = './dist/src/index.d.ts';

    greenLog(`Updating ${packageJsonPath}...`);
    greenLog(`packageJson.main: ${packageJson.main}`);
    greenLog(`packageJson.typings: ${packageJson.typings}`);

    await writeJsonFile(packageJsonPath, packageJson);

    // add a new line to the packageJson content to avoid linting issues
    const content = readFileSync(packageJsonPath, 'utf8');
    fs.writeFileSync(packageJsonPath, `${content}\n`);
  };

  if (PROJECT_NAME === '--target') {
    const TARGET = args[2];

    await setupSymlink(TARGET);
  } else {
    const packageList = (await listDirsRecursive('./packages', false)).map(
      (item) => item.replace('packages/', '')
    );
    await asyncForEach(packageList, async (item) => {
      await setupSymlink(item);
    });
  }

  exit();
}

async function matchVersionsFunc() {
  // async foreach packages
  const packageList = await listDirsRecursive('./packages', false);

  // get lerna version
  const lernaJson = await readJsonFile(`lerna.json`);

  await asyncForEach(packageList, async (pkg) => {
    const packageJson = await readJsonFile(`${pkg}/package.json`);
    packageJson.version = lernaJson.version;

    greenLog(
      `Updating ${pkg}/package.json version ${packageJson.version} => ${lernaJson.version}...`
    );
    await writeJsonFile(`${pkg}/package.json`, packageJson);
  });

  exit();
}

async function validateDependencyVersions() {
  const PREFIX = '@lit-protocol';
  const ignoreList = ['@lit-protocol/contracts', '@lit-protocol/wrapped-keys', '@lit-protocol/wrapped-keys-lit-actions'];

  const packageList = (await listDirsRecursive('./packages', false)).map(
    (item) => {
      return `dist/${item}/package.json`;
    }
  ).filter((item) => {
    if(item.includes('wrapped-keys')) {
      greenLog(`Skipping ${item}`);
      return false
    }

    return true
  });

  const packageTotal = packageList.length;
  let packagePasses = 0;

  await asyncForEach(packageList, async (pkg, i) => {
    const packageJson = await readJsonFile(pkg);
    const pkgVersion = packageJson.version;

    const dependencies = packageJson?.dependencies ?? {};

    let total = 0;
    let passes = 0;
    let fails = 0;

    // search for dependencies that start with @lit-protocol
    for (const [key, value] of Object.entries(dependencies)) {
      if (key.includes(PREFIX) && !ignoreList.includes(key)) {
        total++;
        if (value !== pkgVersion) {
          fails++;
        } else {
          passes++;
        }
      }
    }

    if (fails > 0) {
      redLog(
        `❌ ${pkg} has ${fails} dependencies with versions that do not match.`
      );
    } else {
      greenLog(
        `✅ ${i + 1} ${pkg} contains all dependencies with matching versions.`
      );
      packagePasses++;
    }
  });

  // log that to make sure the builds works, make sure we have tested it
  if (packagePasses >= packageTotal) {
    greenLog(
      `
    ❗️ Before publishing, make sure you have tested the build!
      - yarn test:unit     | run unit tests
      - yarn test:local    | run e2e tests on nodejs
      `,
      true
    );

    console.log(`
    Note: for e2e nodejs test, you can use the following options:
    -------------------------------------------------------------
    --filter flag to filter tests (eg. yarn test:local --filter=Encryption)
    `);
  }
  process.exit(0);
}
