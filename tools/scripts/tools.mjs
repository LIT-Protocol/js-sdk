import { exit } from 'process';
import {
  asyncForEach,
  childRunCommand,
  findImportsFromDir,
  findStrFromDir,
  getArgs,
  getFlag,
  greenLog,
  listDirsRecursive,
  prefixPathWithDir,
  readFile,
  readJsonFile,
  redLog,
  replaceAutogen,
  replaceFileContent,
  spawnCommand,
  spawnListener,
  writeFile,
  writeJsonFile,
  checkEmptyDirectories,
} from './utils.mjs';
import fs, { readFileSync } from 'fs';

const args = getArgs();

const OPTION = args[0];

const optionMaps = new Map([
  ['--help', () => helpFunc()],
  ['--create', () => createFunc()],
  ['--path', () => pathFunc()],
  ['--test', () => testFunc()],
  ['--find', () => findFunc()],
  ['--switch', () => switchFunc()],
  ['--comment', () => commentFunc()],
  ['--remove-local-dev', () => removeLocalDevFunc()],
  ['--setup-local-dev', () => setupLocalDevFunc()],
  ['--match-versions', () => matchVersionsFunc()],
  ['default', () => helpFunc()],
  ['--verify', () => validateDependencyVersions()],
  ['--postBuild', () => postBuild()],
  ['fixTsConfig', () => fixTsConfigFunc()],
  ['check', () => checkFunc()],
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
            --create: create a new app
            --path: a directory to run commands in
            --test: run tests
            --find: different search options
            --publish: publish to npm
            --clone: clone a package from ./dist and publish to npm
            --build: build the project
            --dev: run dev stuff
            --remove-local-dev: remove local dev
            --setup-local-dev: setup local dev
            --match-versions: match versions
            --version: show version
            --verify: validate dependency versions
            --postBuild: post build
            fixTsConfig: fix tsconfig
    `,
    true
  );
  exit();
}

async function createFunc() {
  let APP_TYPE = args[1];

  if (!APP_TYPE || APP_TYPE === '' || APP_TYPE === '--help') {
    greenLog(
      `
        Usage: node tools/scripts/tools.mjs --create [app-type]
        [app-type]: the type of app to create
        Options:
        --react: create a react app
        --html: create a html app
        --node: create a node app
        `,
      true
    );
    exit();
  }

  let APP_NAME = args[2];
  const TYPE = args[3];

  if (APP_TYPE === '--react') {
    if (!TYPE || TYPE === '' || TYPE === '--help') {
      greenLog(
        `
            Usage: node tools/scripts/tools.mjs --create --react [app_name] [type]
            [type]: the type of react app to create
            Options:
            --demo: prepend 'demo' and append '-react' to the app name
            `,
        true
      );
    }

    if (TYPE === '--demo') {
      APP_NAME = `demo-${APP_NAME}-react`;
    }

    const INSTALL_PATH = `apps/${APP_NAME}`;

    await childRunCommand(
      `git clone https://github.com/LIT-Protocol/demo-project-react-template ${INSTALL_PATH}`
    );

    await writeFile(
      `${INSTALL_PATH}/src/App.js`,
      replaceAutogen({
        oldContent: await readFile(`${INSTALL_PATH}/src/App.js`),
        startsWith: '// ----- autogen:app-name:start  -----',
        endsWith: '// ----- autogen:app-name:end  -----',
        newContent: `const [appName, setAppName] = useState('${APP_NAME}');`,
      })
    );

    const indexHtml = await readFile(`${INSTALL_PATH}/public/index.html`);
    const newHtml = indexHtml.replace('Demo', `Demo: ${APP_NAME}`);
    await writeFile(`${INSTALL_PATH}/public/index.html`, newHtml);

    await childRunCommand(`rm -rf ${INSTALL_PATH}/.git`);

    const packageJson = await readJsonFile(`${INSTALL_PATH}/package.json`);
    packageJson.name = APP_NAME;

    // generate a port number between 4100 and 4200
    const port = Math.floor(Math.random() * 100) + 4100;
    packageJson.scripts.start = `PORT=${port} react-scripts start`;

    await writeFile(
      `${INSTALL_PATH}/package.json`,
      JSON.stringify(packageJson, null, 2)
    );

    await childRunCommand(`cd ${INSTALL_PATH} && yarn install`);

    greenLog(`Creating a project.json for nx workspace`);

    const projectJson = await readFile(`tools/scripts/project.json.template`);
    const newProjectJson = projectJson
      .replaceAll('PROJECT_NAME', APP_NAME)
      .replaceAll('PROJECT_PATH', `apps/${APP_NAME}`)
      .replaceAll('PROJECT_PORT', port);

    await writeFile(`${INSTALL_PATH}/project.json`, newProjectJson);

    greenLog('Adding project to nx workspace');

    const workspaceJson = await readJsonFile(`workspace.json`);

    workspaceJson.projects[APP_NAME] = INSTALL_PATH;

    await writeFile(`workspace.json`, JSON.stringify(workspaceJson, null, 2));

    greenLog('✅ NX Build Done! Post Build in progress...');
  }

  if (APP_TYPE == '--html') {
    if (!TYPE || TYPE === '' || TYPE === '--help') {
      greenLog(
        `
            Usage: node tools/scripts/tools.mjs --create --html [type]
            [type]: the type of html app to create
            Options:
            --demo: prepend 'demo' and append '-html' to the app name
            `,
        true
      );
    }

    redLog('Not implemented yet');
    exit();
  }

  if (APP_TYPE == '--node') {
    if (!TYPE || TYPE === '' || TYPE === '--help') {
      greenLog(
        `
            Usage: node tools/scripts/tools.mjs --create --node [type]
            [type]: the type of node app to create
            Options:
            --demo: prepend 'demo' and append '-node' to the app name
            `,
        true
      );
    }

    redLog('Not implemented yet');
    exit();
  }
}

async function pathFunc() {
  const PROJECT_PATH = args[1];
  const COMMANDS = args.slice(2);

  if (!PROJECT_PATH || PROJECT_PATH === '' || PROJECT_PATH === '--help') {
    greenLog(
      `
        Usage: node tools/scripts/tools.mjs --path [project-path] [commands]
            [project-path]: the path of the project
            [commands]: the commands to run
    `,
      true
    );
    exit();
  }

  spawnCommand(COMMANDS[0], COMMANDS.slice(1), { cwd: PROJECT_PATH });
}

async function testFunc() {
  const TEST_TYPE = args[1];

  if (!TEST_TYPE || TEST_TYPE === '' || TEST_TYPE === '--help') {
    greenLog(
      `
      Usage: node tools/scripts/tools.mjs --test [test-type]
          [test-type]: the type of test to run
              --unit: run unit tests
  `,
      true
    );
    exit();
  }
}

async function findFunc() {
  const FIND_TYPE = args[1];

  if (!FIND_TYPE || FIND_TYPE === '' || FIND_TYPE === '--help') {
    greenLog(
      `
        Usage: node tools/scripts/tools.mjs --find [option]
            [option]:
                --imports: find all imports from a directory
    `,
      true
    );
    exit();
  }

  if (FIND_TYPE === '--imports') {
    const TARGET_DIR = args[2];
    const FILTER = args[3];

    if (!TARGET_DIR || TARGET_DIR === '' || TARGET_DIR === '--help') {
      greenLog(
        `
            Usage: node tools/scripts/tools.mjs --find --imports [target-dir]
                [target-dir]: the directory to find imports from
        `,
        true
      );
      exit();
    }

    let res = await findImportsFromDir(TARGET_DIR);

    greenLog(
      `
            Usage: node tools/scripts/tools.mjs --find --imports [target-dir] --filter [keyword]
                [keyword]: the keyword to filter the results by
        `,
      true
    );

    if (FILTER === '--filter') {
      const keyword = args[4];

      res = res.filter((item) => item.includes(keyword));
    }

    console.log(res);
    exit();
  }
}

async function publishFunc() {
  let OPTION2 = args[1];

  if (!OPTION2 || OPTION2 === '' || OPTION2 === '--help') {
    greenLog(
      `
        Usage: node tools/scripts/tools.mjs --publish [option]
            [option]: the option to run
                --build: build packages before publishing
                --no-build: publish without building
                --tag: publish with a tag
                --target: publish a specific package
    `,
      true
    );

    exit();
  }

  if (OPTION2 === '--build') {
    spawnListener('yarn build:packages', {
      onDone: () => {
        spawnListener('yarn npx lerna publish --force-publish', {
          onDone: () => {
            console.log('Done!');
          },
        });
      },
    });
  }

  if (OPTION2 === '--no-build') {
    spawnListener('yarn npx lerna publish --force-publish', {
      onDone: () => {
        console.log('Done!');
      },
    });
  }

  if (OPTION2 === '--tag') {
    const TAG = args[2];

    if (!TAG || TAG === '' || TAG === '--help') {
      greenLog(
        `
            Usage: node tools/scripts/tools.mjs --publish --tag [tag]
                [tag]: the tag to publish with
            `,
        true
      );
    }

    spawnListener(`yarn npx lerna publish --force-publish --dist-tag ${TAG}`, {
      onDone: async () => {
        const dirs = (await listDirsRecursive('./dist/packages', false)).filter(
          (item) => item.includes('-vanilla')
        );

        await asyncForEach(dirs, async (dir) => {
          await childRunCommand(`cd ${dir} && npm publish --tag ${TAG}`);
        });

        exit();
      },
    });
    // const dirs = (await listDirsRecursive('./dist/packages', false));

    // await asyncForEach(dirs, async (dir) => {
    //     await childRunCommand(`cd ${dir} && npm publish --tag ${TAG}`);
    // })

    // console.log(dirs);
  }

  if (OPTION2 === '--target') {
    const TARGET = args[2];

    if (!TARGET || TARGET === '' || TARGET === '--help') {
      greenLog(
        `
            Usage: node tools/scripts/tools.mjs --publish --target [target]
                [target]: the target to publish
            `,
        true
      );
    }

    await childRunCommand(
      `cd dist/packages/${TARGET} && npm publish --access public`
    );
    exit();
  }
}

async function switchFunc() {
  const SCOPE = args[1];

  if (!SCOPE || SCOPE === '' || SCOPE === '--help') {
    greenLog(
      `
        Usage: node tools/scripts/tools.mjs --switch [scope]
            [scope]: the scope to switch
                --all: switch all packages
    `,
      true
    );

    exit();
  }

  if (SCOPE == '--all') {
    const FROM_NAME = args[2];
    const TO_NAME = args[3];

    if (
      !FROM_NAME ||
      FROM_NAME === '' ||
      FROM_NAME === '--help' ||
      !TO_NAME ||
      TO_NAME === '' ||
      TO_NAME === '--help'
    ) {
      greenLog(
        `
            Usage: node tools/scripts/tools.mjs --switch --all [from] [to]
                [from]: the string to replace
                [to]: the string to replace with
        `,
        true
      );

      exit();
    }

    const dirs = await listDirsRecursive('./dist/packages', true);

    let paths = [];

    for (let i = 0; i < dirs.length; i++) {
      const dir = dirs[i];
      let _paths = await findStrFromDir(dir, FROM_NAME);
      paths.push(_paths);
    }

    // remove empty array
    paths = paths.filter((item) => item.length > 0);

    // flatten array
    paths = paths.flat();

    // for each file that contains the string, replace it
    for (let i = 0; i < paths.length; i++) {
      const file = paths[i];
      await replaceFileContent(paths[i], FROM_NAME, TO_NAME);
      greenLog(`Replaced ${FROM_NAME} with ${TO_NAME} in ${file}`);

      if (i === paths.length - 1) {
        console.log('Done!');
      }
    }

    exit();
  }
}

async function fixTsConfigFunc() {
  const TSCONFIG = JSON.parse(await readFile('tsconfig.json'));

  TSCONFIG.compilerOptions.paths = {
    '@lit-protocol/*': ['packages/*/src'],
  };

  await writeFile('tsconfig.json', JSON.stringify(TSCONFIG, null, 2));

  process.exit();
}

async function checkFunc() {
  /**
   * When you are working on a branch and you switch to another branch, you might have empty directories.
   */
  if (!getFlag('--no-empty-directories')) {
    redLog('Please use the --no-empty-directories flag to run this command');
    process.exit();
  }

  const emptyDirectories = await checkEmptyDirectories('packages');

  // If there's any empty directories, say that "Empty directories found! Do you want to remove then? This happened because you might be switching branches."
  if (emptyDirectories.length > 0) {
    redLog(
      `\n❌ Empty directories found! Do you want to remove then?\n\n    ${emptyDirectories.join(
        '\n'
      )}\n`,
      true
    );
    process.exit(1);
  }

  process.exit(0);
}

async function commentFunc() {
  const C = args[1] ?? '=';

  // combine args except for the first index
  const MESSAGE = args.slice(2).join(' ');

  if (!MESSAGE || MESSAGE === '' || MESSAGE === '--help') {
    greenLog(
      `
        Usage: node tools/scripts/tools.mjs --comment [message]
            [message]: the message to add to the comment block
        `,
      true
    );

    exit();
  }

  let up = [];
  let down = [];

  for (let i = 0; i < MESSAGE.length; i++) {
    up.push(C);
    down.push(C);
  }

  // create a line with 10 ${C}
  const line = `${C}${C}${C}${C}${C}${C}${C}${C}${C}${C}`;

  console.log(
    `
// ${line}${up.join('')}${line}
//          ${MESSAGE}
// ${line}${down.join('')}${line}
    `
  );
  exit();
}

async function removeLocalDevFunc() {
  // First, remove existing dist symlink if exists.
  const removeList = (await listDirsRecursive('./packages', false)).map(
    (item) => item.replace('packages/', '')
  );

  console.log('removeList', removeList);

  await asyncForEach(removeList, async (item) => {
    greenLog(
      `Removing:
- symlink packages/${item}/dist
- "main" and "typings" from packages/${item}/package.json
        `,
      true
    );
    await childRunCommand(`rm -rf packages/${item}/dist`);

    const packageJson = await readJsonFile(`packages/${item}/package.json`);

    delete packageJson.main;
    delete packageJson.typings;

    await writeJsonFile(`packages/${item}/package.json`, packageJson);
  });

  exit();
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
  const ignoreList = ['@lit-protocol/accs-schemas', '@lit-protocol/contracts', '@lit-protocol/vincent-contracts-sdk'];

  const packageList = (await listDirsRecursive('./packages', false)).map(
    (item) => {
      return `dist/${item}/package.json`;
    }
  );

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

async function postBuild() {
  // greenLog('...mapping dist package name to package.json name');
  // await runCommand('yarn postBuild:mapDistFolderNameToPackageJson');

  greenLog('...generating apps/nodejs/main.ts');

  exit();
}
