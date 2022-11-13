// # Usage: node tools/scripts/pub.mjs

import { exit } from "process";
import { asyncForEach, greenLog, listDirsRelative, runCommand, getArgs } from "./utils.mjs";
import { exec } from 'child_process';

const args = getArgs();
const FLAG = args[0];
const VALUE = args[1];
const FLAG2 = args[2];

let dirs = await listDirsRelative('dist/packages', false);

if( FLAG === '--filter' ) {
    dirs = dirs.filter((dir) => dir.includes(VALUE));
}

await asyncForEach(dirs, async (dir) => {
    greenLog(`Publishing ${dir}`);

    if (FLAG2 !== '--dry-run') {
        
        // await runCommand(`cd ${dir} && npm publish --access public`);
        exec("echo 123");
    }else{
        greenLog(`Dry run, skipping publish`);
    }
});

exit();