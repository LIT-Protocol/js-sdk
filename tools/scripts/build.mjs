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
  // Only proceed to build if not already built, by checking for dist/packages folder
  // const nxDistPath = `dist/packages/${name}`;
  // if (fs.existsSync(nxDistPath)) {
  //   yellowLog(`Skipping build for ${name}, because it has already been built.`);
  //   return;
  // }

  greenLog('Building project: ' + name);

  const packageDistPath = `packages/${name}/dist`;
  if (fs.existsSync(packageDistPath)) {
    greenLog(`Removing ${packageDistPath} ...`);
    await runCommand(`rm ${packageDistPath}`);
  }

  greenLog('Building Tsc...');
  await runCommand(`yarn nx run ${name}:_buildTsc`);

  greenLog('Building Vanilla...');
  await runCommand(`yarn nx run ${name}:_buildWeb`);

  greenLog('Polyfilling...');
  await childRunCommand(`yarn tools --polyfills ${name}`);

  // greenLog('Setting up local development tools...');
  // await childRunCommand(`yarn build:setupLocalDev ${name}`);

  if (!skipGen) {
    greenLog('...mapping dist package name to package.json name');
    await runCommand('yarn postBuild:mapDistFolderNameToPackageJson');

    greenLog('...generating apps/html/index.html');
    await runCommand('yarn tool:genHtml');

    greenLog('...generating apps/react/src/app/app.tsx');
    await runCommand('yarn tool:genReact');

    greenLog('...generating apps/nodejs/main.ts');
    await runCommand('yarn tool:genNodejs');
  }
};

await build(projectName);

exit();
