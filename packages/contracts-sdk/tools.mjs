import { exit } from "process";
import { childRunCommand, getArgs, greenLog } from "../../tools/scripts/utils.mjs";
import { spawn } from 'child_process';

const args = getArgs();

const OPTION = args[0];

if (!OPTION || OPTION === '' || OPTION === 'help') {
    greenLog(`
        Usage: node 'packages/contracts-sdk/tools.mjs' [option]
        Options:
            --help: show this help
            --fetch: Fetches and processes ABI files for a set of deployed contracts.
            --gen: replacing certain sections of the contracts-sdk.ts file with the generated content
    `, true);
    exit();
}

if (OPTION === '--fetch') {
    await childRunCommand('node packages/contracts-sdk/fetch-contracts.mjs');
}

if (OPTION === '--gen') {
    await childRunCommand('node packages/contracts-sdk/gen-code.mjs');
}

if (OPTION === '--update') {
    await childRunCommand('node packages/contracts-sdk/tools.mjs --fetch');
    await childRunCommand('node packages/contracts-sdk/tools.mjs --gen');
}

exit();