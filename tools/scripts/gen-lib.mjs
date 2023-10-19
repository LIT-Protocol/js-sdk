// Usage: node tools/scripts/gen-lib.mjs

import {
  runCommand,
  getArgs,
  writeJsonFile,
  question,
  greenLog,
  wait,
  readJsonFile,
  redLog,
  writeFile,
  readFile,
} from './utils.mjs';
import devkit from '@nx/devkit';
import { exit } from 'process';
import fs from 'fs';

const args = getArgs();
const PROJECT_NAME = args[0];
const TAG = args[1];

let alreadyExists = false;

const REPO_URL = 'https://github.com/Lit-Protocol/js-sdk';

if (!PROJECT_NAME) {
  redLog(
    `
  Please provide a project name:

  yarn gen:lib my-lib <universal | vanilla | nodejs>
  `,
    true
  );
  exit();
}

if (
  TAG !== 'universal' &&
  TAG !== 'bundle' &&
  TAG !== 'vanilla' &&
  TAG !== 'nodejs'
) {
  redLog(
    `Please provide a tag: universal OR vanilla OR nodejs

    yarn gen:lib ${PROJECT_NAME} universal 
  `,
    true
  );
  exit();
}

greenLog(`Creating ${PROJECT_NAME} library...`);
try {
  await runCommand(`yarn nx generate @nx/js:library --name=${PROJECT_NAME}`);
} catch (e) {
  greenLog(`${PROJECT_NAME} already exists.`);
  alreadyExists = true;
}

await wait(1000);

/**
 *
 * This function modify the default built config in the project.json
 * file under "targets" property
 * @param { string } name the name of the package
 * @return { object } the new config
 */
const createBuild = (name) => {
  return {
    build: {
      executor: 'nx:run-commands',
      options: {
        command: `yarn build:target ${name}`,
      },
    },
  };
};

/**
 *
 * This function creates a new build config for esbuild,
 * and add it under the "targets" property in the project.json
 * @param { string } name the name of the project
 * @param { object }
 *  @property { string } globalPrefix the prefix of the global variable
 *
 */
const createBuildWeb = (name, { globalPrefix = 'LitJsSdk' }) => {
  const camelCase = name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

  return {
    _buildWeb: {
      executor: '@websaam/nx-esbuild:package',
      options: {
        globalName: `${globalPrefix}_${camelCase}`,
        outfile: `dist/packages/${name}-vanilla/${name}.js`,
        entryPoints: [`./packages/${name}/src/index.ts`],
        define: {
          'process.env.NODE_DEBUG': 'false',
          global: 'window',
        },
        plugins: [
          {
            package: 'esbuild-node-builtins',
            function: 'nodeBuiltIns',
          },
        ],
      },
    },
  };
};

const getProject = () => {
  const graph = devkit.readCachedProjectGraph();
  const nodes = graph.nodes;

  const project = nodes[PROJECT_NAME].data;

  return project;
};

/**
 * Modify the configuration file by adding a new line.
 *
 * Usage:
 * node modify-config.mjs <path-to-config-file>
 */
async function modifyConfigFile(configFilePath, newLine) {
  try {
    const configFileContent = await readFile(configFilePath);
    const lines = configFileContent.split('\n');

    // const newLine = "  setupFilesAfterEnv: ['../../jest.setup.js'],";

    const closingBracketIndex = lines.findIndex((line) => line === '};');
    lines.splice(closingBracketIndex, 0, newLine);

    const updatedConfigFileContent = lines.join('\n');
    await writeFile(configFilePath, updatedConfigFileContent);

    console.log('Configuration file updated successfully.');
  } catch (error) {
    console.error(`Failed to update configuration file: ${error.message}`);
  }
}

/**
 *
 * Edit the project project.json file
 *
 */
const editProjectJson = async () => {
  const project = getProject();

  delete project.files;
  delete project.root;
  delete project.targets.build.dependsOn;

  project.targets['_buildTsc'] = project.targets.build;
  project.targets['_buildWeb'] = createBuildWeb(PROJECT_NAME, {
    globalPrefix: 'LitJsSdk',
  })._buildWeb;
  project.targets['build'] = createBuild(PROJECT_NAME).build;

  // move 'lint' and 'test' objects to the end
  const { lint, test, ...rest } = project.targets;
  project.targets = { ...rest, lint, test };

  const writePath = project.sourceRoot.split('src')[0] + 'project.json';

  await writeJsonFile(writePath, project);
};

const editPackageJson = async () => {
  const project = getProject();
  const packageJson = project.root + '/package.json';

  let packageJsonData = await readJsonFile(packageJson);

  packageJsonData = {
    ...packageJsonData,
    ...{
      license: 'MIT',
      homepage: REPO_URL,
      repository: {
        type: 'git',
        url: REPO_URL,
      },
      keywords: ['library'],
      bugs: {
        url: `${REPO_URL}/issues`,
      },
      publishConfig: {
        access: 'public',
        directory: `../../dist/packages/${PROJECT_NAME}`,
      },
      main: './dist/src/index.js',
      typings: './dist/src/index.d.ts',
      browser: {
        crypto: false,
        stream: false,
      },
      tags: [TAG],
    },
  };

  const writePath = project.sourceRoot.split('src')[0] + 'package.json';

  await writeJsonFile(writePath, packageJsonData);
};

const editJestConfig = async () => {
  const projectRoot = getProject().root;
  const jestConfigPath = projectRoot + '/jest.config.ts';
  const newLine = "  setupFilesAfterEnv: ['../../jest.setup.js'],";
  modifyConfigFile(jestConfigPath, newLine);
};

if (!alreadyExists) {
  await editProjectJson();
  await editPackageJson();
  await editJestConfig();
  exit();
}

await question(
  `Do you want to update ${PROJECT_NAME} project.json & package.json?`,
  {
    yes: async () => {
      await editProjectJson();
      await editPackageJson();
      await editJestConfig();
      exit();
    },
    no: () => {
      exit();
    },
  }
);

exit();
