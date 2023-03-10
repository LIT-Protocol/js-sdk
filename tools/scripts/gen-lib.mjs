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
} from './utils.mjs';
import { readCachedProjectGraph } from '@nrwl/devkit';
import { exit } from 'process';
const args = getArgs();
const PROJECT_NAME = args[0];
const TAG = args[1];

let alreadyExists = false;

if (!PROJECT_NAME) {
  redLog(
    `
  Please provide a project name:

  yarn gen:lib my-lib
  `,
    true
  );
  exit();
}

if (TAG !== 'universal' && TAG !== 'bundle' && TAG !== 'vanilla') {
  redLog(
    `Please provide a tag: universal OR bundle OR vanilla

    yarn gen:lib ${PROJECT_NAME} universal 
  `,
    true
  );
  exit();
}

greenLog(`Creating ${PROJECT_NAME} library...`);
try {
  await runCommand(`yarn nx generate @nrwl/js:library --name=${PROJECT_NAME}`);
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

/**
 *
 * Edit the project project.json file
 *
 */
const editProjectJson = async () => {
  const graph = readCachedProjectGraph();
  const nodes = graph.nodes;

  const project = nodes[PROJECT_NAME].data;

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
  const graph = readCachedProjectGraph();
  const nodes = graph.nodes;

  const project = nodes[PROJECT_NAME].data;

  const packageJson = project.root + '/package.json';

  let packageJsonData = await readJsonFile(packageJson);

  packageJsonData = {
    ...packageJsonData,
    ...{
      license: 'MIT',
      homepage: 'https://github.com/Lit-Protocol/js-sdk',
      repository: {
        type: 'git',
        url: 'https://github.com/LIT-Protocol/js-sdk',
      },
      keywords: ['library'],
      bugs: {
        url: 'https://github.com/LIT-Protocol/js-sdk/issues',
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

if (!alreadyExists) {
  await editProjectJson();
  await editPackageJson();
  exit();
}

await question(
  `Do you want to update ${PROJECT_NAME} project.json & package.json?`,
  {
    yes: async () => {
      await editProjectJson();
      await editPackageJson();
      exit();
    },
    no: () => {
      exit();
    },
  }
);

exit();
