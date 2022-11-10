// Usage: node tools/scripts/build.mjs <project-name>

import { exit } from 'process';
import { greenLog, runCommand, getArgs, redLog, wait } from './utils.mjs'

const args = getArgs();

const projectName = args[0];
const skipGen = args[1] === '--skip';

if( projectName === undefined ) {
    redLog("Project name is required: 'node tools/scripts/build.mjs <project-name>'");
    exit();
}

const build = async (name) => {
    greenLog("Building project: " + name);

    greenLog("Building Tsc...");
    await runCommand(`yarn nx run ${name}:_buildTsc`);
    
    greenLog("Building Vanilla...");
    await runCommand(`yarn nx run ${name}:_buildWeb`);

    if ( ! skipGen ){
        
        greenLog("...mapping dist package name to package.json name");
        await runCommand('yarn build:matchFolderNameAsPackageName')
        
        greenLog("...generating app/html/index.html");
        await runCommand('yarn tool:genHtml')
        
        greenLog("...generating app/nodejs/main.ts");
        await runCommand('yarn tool:genNodejs')

    }
}

await build(projectName);

exit();