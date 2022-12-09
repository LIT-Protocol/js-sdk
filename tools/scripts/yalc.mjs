// #Usage: node tools/scripts/yalc.mjs
import { exit } from 'process';
import { asyncForEach, getArgs, greenLog, listDirsRecursive, runCommand } from './utils.mjs';

const args = getArgs();

const TARGET = args[0] || 'all';

const dirs = (await listDirsRecursive('dist/packages', false))
    .filter((dir) => ! dir.includes('vanilla'));

if( TARGET === 'all'){
    await runCommand("yarn build:packages");
}else{
    console.log(`...building ${TARGET}`);
    await runCommand(`yarn nx run ${TARGET}`);
    await runCommand('yarn postBuild:mapDepsToDist');
}

await runCommand("yarn lerna version patch --force-publish --no-commit-hooks --no-push --yes");

let yalcs = [];

await asyncForEach(dirs, async dir => {
    const res = await runCommand(`cd ${dir} && yalc push`);
    greenLog(res);

    // get text before the second @
    const name = res.split('@')[1].split('/')[0];

    // get text after / but before @
    const version = res.split('@')[1].split('/')[1].split('@')[0];
    yalcs.push(`@${name}/${version}`);
})

console.log("Commands:", `yalc add ${yalcs.join(' ')}`);

exit();