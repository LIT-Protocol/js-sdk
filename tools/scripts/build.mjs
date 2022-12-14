// Usage: node tools/scripts/build.mjs <project-name>

import { exit } from 'process';
import { greenLog, runCommand, getArgs, redLog, wait, readFile, yellowLog, replaceAutogen, writeFile, childRunCommand } from './utils.mjs'

const args = getArgs();

const projectName = args[0];
const skipGen = args[1] === '--skip';

if (projectName === undefined) {
    redLog("Project name is required: 'node tools/scripts/build.mjs <project-name>'");
    exit();
}

const build = async (name) => {
    greenLog("Building project: " + name);

    greenLog("Building Tsc...");
    await runCommand(`yarn nx run ${name}:_buildTsc`);

    greenLog("Building Vanilla...");
    await runCommand(`yarn nx run ${name}:_buildWeb`);

    greenLog("Polyfilling...");
    await childRunCommand(`yarn tools --polyfills ${name}`);

    if (!skipGen) {

        greenLog("...mapping dist package name to package.json name");
        await runCommand('yarn postBuild:mapDistFolderNameToPackageJson')

        greenLog("...generating apps/html/index.html");
        await runCommand('yarn tool:genHtml')

        greenLog("...generating apps/react/src/app/app.tsx");
        await runCommand('yarn tool:genReact')

        greenLog("...generating apps/nodejs/main.ts");
        await runCommand('yarn tool:genNodejs')

    }
}

await build(projectName);

exit();