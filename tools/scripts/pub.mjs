// # Usage: node tools/scripts/pub.mjs
// import { exec } from 'child_process';

import { exit } from 'process';
import {
  asyncForEach,
  greenLog,
  listDirsRecursive,
  getArgs,
  spawnCommand,
  readJsonFile,
  redLog,
  question,
  writeJsonFile,
  yellowLog,
} from './utils.mjs';

const args = getArgs();
const OPTION = args[0];
const VALUE = args[1];

if (!OPTION || OPTION === '' || OPTION === '--help') {
  greenLog(
    `
  Usage: node tools/scripts/pub.mjs [option] [value]
  option:
    --tag: publish with a tag
    --prod: publish to production
  `,
    true
  );
  exit();
}

if (OPTION) {
  if (OPTION === '--tag') {
    if (!VALUE) {
      redLog('Please provide a tag value', true);
      exit();
    }
  }

  if (OPTION === '--prod') {
    console.log('Publishing to production');
  }
}

let dirs = await listDirsRecursive('dist/packages', false);

console.log('Ready to publish the following packages:');

await asyncForEach(dirs, async (dir) => {
  // read the package.json file
  const pkg = await readJsonFile(`${dir}/package.json`);

  greenLog(`${pkg.name} => ${pkg.version}`);

  // remove peer dependencies
  delete pkg.peerDependencies;

  // write the package.json file
  await writeJsonFile(`${dir}/package.json`, pkg);
  // // check version
  // const res = versionChecker(pkg, lernaVersion);

  // if (res.status === 500) {
  //   redLog(res.message);
  // }

  // if (res.status === 200) {
  //   greenLog(res.message);
  // }
});

// prompt user to confirm publish
const type =
  OPTION === '--tag'
    ? `TAG => ${VALUE}

  You will need to install like this: yarn add @lit-protocol/lit-node-client@${VALUE}`
    : 'PRODUCTION';

greenLog(
  `
  Publishing: ${type}
`,
  true
);

await question('Are you sure you want to publish to? (y/n)', {
  yes: async () => {
    greenLog('Publishing...');
    // await 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));

    let counter = 0;

    await asyncForEach(dirs, async (dir) => {
      // read the package.json file
      const pkg = await readJsonFile(`${dir}/package.json`);

      // Keep the original package version for publishing
      const originalVersion = pkg.version;

      // write the package.json file back
      await writeJsonFile(`${dir}/package.json`, pkg);

      if (OPTION === '--tag') {
        greenLog(`Publishing ${dir} with version ${originalVersion} and tag ${VALUE}`);

        spawnCommand(
          'npm',
          ['publish', '--access', 'public', '--tag', VALUE],
          {
            cwd: dir,
          },
          {
            logExit: false,
            exitCallback: () => {
              counter++;
            },
          }
        );
      }

      if (OPTION === '--prod') {
        greenLog(`Publishing ${dir} with version ${originalVersion}`);

        spawnCommand(
          'npm',
          ['publish', '--access', 'public'],
          {
            cwd: dir,
          },
          {
            logExit: false,
            exitCallback: () => {
              counter++;
            },
          }
        );
      }
    });

    while (true) {
      // wait for 1 second
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (counter >= dirs.length) {
        greenLog('🎉 Publish complete!', true);
        exit(0);
      }
    }
  },
  no: () => {
    redLog('Publish cancelled', true);
    exit(0);
  },
});
