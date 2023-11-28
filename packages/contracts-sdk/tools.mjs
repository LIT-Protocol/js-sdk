import { exit } from 'process';
import {
  childRunCommand,
  getArgs,
  greenLog,
} from '../../tools/scripts/utils.mjs';

const args = getArgs();

const OPTION = args[0];

if (!OPTION || OPTION === '' || OPTION === '--help') {
  greenLog(
    `
        Usage: node 'packages/contracts-sdk/tools.mjs' [option]
        Options:
            --help: show this help
            --fetch: yarn update:contracts
            --gen: replacing certain sections of the contracts-sdk.ts file with the generated content
    `,
    true
  );
  exit();
}

if (OPTION === '--gen') {
  await childRunCommand('node packages/contracts-sdk/gen-code.mjs');
}

if (OPTION === '--update') {
  await childRunCommand('node packages/contracts-sdk/tools.mjs --fetch');
  await childRunCommand('node packages/contracts-sdk/tools.mjs --gen');
}

exit();
