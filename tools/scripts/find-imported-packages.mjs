// # Usage: node tools/scripts/find-imported-packages.mjs packages --filter=ethers

import { exit } from 'process';
import { listDirsRelative, findImportsFromDir, asyncForEach, greenLog, wait, getArgs, redLog } from './utils.mjs'

const args = getArgs();

// const TARGET = 'packages/auth-browser';
const TARGET = args[0];
const FLAG = args[1]?.split('=')[0];
const VALUE = args[1]?.split('=')[1];

const FLAG2 = args[2]?.split('=')[0];
const VALUE2 = args[2]?.split('=')[1];

if (!TARGET) {
    redLog('Please provide a target directory');
    exit();
}

const dirs = await listDirsRelative(TARGET);

const sets = [];
// const test = await findImportsFromDir('packages/auth-browser/src/lib/chains');
// console.log(test);
await asyncForEach(dirs, async (dir) => {
    const imports = await findImportsFromDir(dir);

    let size = imports.size;

    // append 1 space if size is 1 digit 
    if (size < 10) {
        size = size + ' ';
    }

    greenLog(`${size} imports found => ${dir}`);
    sets.push(imports);
});

// total number of imports
let total = 0;

// unique imports
const unique = new Set();

sets.forEach((set) => {
    total += set.size;
    set.forEach((item) => {
        unique.add(item);
    });
});

greenLog(`
Total number of imports: ${total}
Unique number of imports: ${unique.size}
`, true);

// exit if unique size is 0
if (unique.size === 0) {
    exit();
}

if (FLAG === '--filter') {
    const filtered = new Set();

    unique.forEach((item) => {
        if (item.includes(VALUE)) {
            filtered.add(item);
        }
    });

    if( filtered.size === 0 ) {
        redLog(`No imports found that match ${VALUE}`, true);
        exit();
    }else{
        console.log(`Filtered that matches ${VALUE}:`, filtered);
    }

    if (FLAG2 == '--write') {
        if (!VALUE2) {
            redLog("Please provide a file name to write to");
            exit();
        }
        greenLog(`Writing to file ${VALUE2}`);
    }
} else {
    console.log("unique:", unique);
}



exit();