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
  getFlag,
  getGroupConfig,
  getGroupPackageNames,
} from './utils.mjs';

const args = getArgs();
const OPTION = args[0];
const VALUE = args[1];

console.log(args);

const groupFlag = getFlag('--group');
console.log('groupFlag:', groupFlag);

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

let version;

if (groupFlag) {
  const groupConfig = getGroupConfig();
  version = groupConfig.config.find((item) => item.group === groupFlag).version;
} else {
  // read lerna.json version
  version = (await readJsonFile('lerna.json')).version;
}

console.log('version:', version);

let dirs = await listDirsRecursive('dist/packages', false);
let newDirs = [];

if (groupFlag) {
  const groupPackages = await getGroupPackageNames(groupFlag);

  groupPackages.forEach((groupPkgName) => {
    dirs.forEach((dir) => {
      if (dir.includes(groupPkgName)) {
        newDirs.push(dir);
      }
    });
  });
}

if (newDirs.length > 0) {
  dirs = newDirs;
}

console.log('Ready to publish the following packages:');

await asyncForEach(dirs, async (dir) => {
  const pkg = await readJsonFile(`${dir}/package.json`);

  greenLog(`${pkg.name} => ${pkg.version}`);

  // remove peer dependencies
  delete pkg.peerDependencies;

  // write the package.json file
  await writeJsonFile(`${dir}/package.json`, pkg);
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

// get latest version
let publishVersion;

if (!groupFlag) {
  try {
    let res = await fetch(
      'https://registry.npmjs.org/@lit-protocol/lit-node-client'
    );

    res = await res.json();

    // get the last one
    const modified = Object.keys(res.time).pop();

    // increase x from 0.0.x to 0.0.x+1
    const version = modified.split('.');
    version[2] = parseInt(version[2]) + 1;
    publishVersion = version.join('.');
    console.log('publishVersion', publishVersion);
  } catch (e) {
    yellowLog(
      "Couldn't get latest version from npm, will use lerna.json version"
    );
  }
}

await question('Are you sure you want to publish to? (y/n)', {
  yes: async () => {
    greenLog('Publishing...');
    // await 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));

    let counter = 0;

    await asyncForEach(dirs, async (dir) => {
      // read the package.json file
      const pkg = await readJsonFile(`${dir}/package.json`);

      // also read the individual package.json and update the version
      try {
        const pkg2 = await readJsonFile(
          `${dir.replace('dist/', '')}/package.json`
        );

        if (OPTION === '--tag' && (VALUE === 'dev' || VALUE === 'test')) {
          pkg2.version = publishVersion;
        } else {
          pkg2.version = version;
        }

        // write the package.json file
        await writeJsonFile(`${dir.replace('dist/', '')}/package.json`, pkg2);
      } catch (e) {
        const path = `${dir.replace('dist/', '')}/package.json`;

        // swallow error if it's not a vanilla package
        if (!path.includes('vanilla')) {
          yellowLog(`No such file or directory: ${path}`);
        }
      }

      // update version
      if (OPTION === '--tag' && (VALUE === 'dev' || VALUE === 'test')) {
        pkg.version = publishVersion;
      } else {
        pkg.version = version;
      }

      // write the package.json file
      await writeJsonFile(`${dir}/package.json`, pkg);

      if (OPTION === '--tag') {
        greenLog(`Publishing ${dir} with tag ${VALUE}`);

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
              // console.log(`${dir} published with tag ${VALUE}`)
            },
          }
        );
      }

      if (OPTION === '--prod') {
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
              // console.log(`${dir} published with tag ${VALUE}`)
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
