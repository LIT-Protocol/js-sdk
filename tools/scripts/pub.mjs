// # Usage: node tools/scripts/pub.mjs
// import { exec } from 'child_process';

import { exit } from 'process';
import {
  asyncForEach,
  greenLog,
  listDirsRecursive,
  runCommand,
  getArgs,
  childRunCommand,
  spawnCommand,
} from './utils.mjs';

const args = getArgs();
const FLAG = args[0];
const VALUE = args[1];
const FLAG2 = args[2];

let dirs = await listDirsRecursive('dist/packages', false);

if (FLAG === '--filter') {
  dirs = dirs.filter((dir) => dir.includes(VALUE));
}

dirs.forEach((dir) => {
  greenLog(`Publishing ${dir}`);

  if (FLAG2 !== '--dry-run') {
    spawnCommand('npm', ['publish', '--access', 'public'], {
      cwd: dir,
    });
    // exec(`cd ${dir} && npm publish --access public`);
  } else {
    greenLog(`Dry run, skipping publish`);
  }
});

exit(0);
