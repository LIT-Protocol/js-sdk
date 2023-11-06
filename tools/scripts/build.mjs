// Usage: node tools/scripts/build.mjs <project-name>

import { exit } from 'process';
import {
  childRunCommand,
  getArgs,
  greenLog,
  yellowLog,
  runCommand,
  redLog,
} from './utils.mjs';
import fs from 'fs';

const args = getArgs();

const projectName = args[0];
const skipGen = args[1] === '--skip';

if (projectName === undefined) {
  redLog(
    "Project name is required: 'node tools/scripts/build.mjs <project-name>'"
  );
  exit();
}

const build = async (name) => {
  greenLog('🏗 Building project: ' + name);

  const packageDistPath = `packages/${name}/dist`;
  if (fs.existsSync(packageDistPath)) {
    greenLog(`Removing ${packageDistPath} ...`);
    await runCommand(`rm ${packageDistPath}`);
  }

  greenLog(`Matching packages/${name}/project.json versions to lerna.json...`);

  greenLog('Building Tsc...');
  await runCommand(`yarn nx run ${name}:_buildTsc`);

  greenLog('Building Vanilla...');
  try {
    await runCommand(`yarn nx run ${name}:_buildWeb`);
  } catch (e) {
    redLog('❌ Vanilla build failed, skipping...');
  }

  greenLog('Polyfilling...');
  await childRunCommand(`yarn tools --polyfills ${name}`);

  await childRunCommand(`yarn tools postBuildIndividual --target=${name}`);

  // greenLog('Setting up local development tools...');
  // await childRunCommand(`yarn build:setupLocalDev ${name}`);

  if (!skipGen) {
    greenLog('...mapping dist package name to package.json name');
    await runCommand('yarn postBuild:mapDistFolderNameToPackageJson');

    // greenLog('...generating apps/html/index.html');
    // await runCommand('yarn gen:html');

    // greenLog('...generating apps/react/src/app/app.tsx');
    // await runCommand('yarn gen:react');

    // greenLog('...generating apps/nodejs/main.ts');
    // await runCommand('yarn gen:nodejs');
  }
};

await build(projectName);

exit();
