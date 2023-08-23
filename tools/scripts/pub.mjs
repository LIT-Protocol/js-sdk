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

console.log('⏰ ========== Getting Ready ========== ⏰');
console.log(args);

const groupFlag = getFlag('--group');
greenLog(`⛳️ groupFlag: ${groupFlag}`);

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

const groupConfig = getGroupConfig();

if (groupFlag) {
  version = groupConfig.config.find((item) => item.group === groupFlag).version;
} else {
  version = groupConfig.config.find((item) => item.group === 'core').version;
}

greenLog(`🔥 version: ${version}`);

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
} else {
  redLog(
    `🚨 No group flag is provided! Please provide a group flag eg. "yarn node ./tools/scripts/pub.mjs --tag revamp --group=revamp"`
  );
  process.exit(1);
}

const groupNPM = groupConfig.config.find(
  (item) => item.group === groupFlag
).npm;

const npmVersionRes = await fetch(groupNPM);
let npmVersion = await npmVersionRes.json();

npmVersion = Object.keys(npmVersion.time).pop();

if (newDirs.length > 0) {
  dirs = newDirs;
}

console.log(
  '\n\n========== Ready to publish the following packages ========== \n'
);

let namespace = await readJsonFile(`${dirs[0]}/package.json`);

const maxNameLength = Math.max(...dirs.map((dir) => dir.length));

await asyncForEach(dirs, async (dir) => {
  const distPkg = await readJsonFile(`${dir}/package.json`);

  const paddedName = distPkg.name.padEnd(maxNameLength, ' ');

  greenLog(`${paddedName} ${npmVersion} => ${distPkg.version}`);

  // remove peer dependencies
  delete distPkg.peerDependencies;

  // write the package.json file
  await writeJsonFile(`${dir}/package.json`, distPkg);
});

// prompt user to confirm publish
const type =
  OPTION === '--tag'
    ? `TAG => ${VALUE}

  You will need to install like this: yarn add ${namespace.name}@${VALUE}`
    : '🚨 PRODUCTION 🚨';

greenLog(
  `
  🚨 Publishing: ${type}
`,
  true
);

// get latest version
let publishVersion;

let TAG;

try {
  TAG = getFlag('--tag', false);
} catch (e) {
  TAG = 'latest';
}

try {
  const groupNpm = getGroupConfig().config.find(
    (item) => item.group === groupFlag
  ).npm;
  // greenLog(`...getting latest version from npm: ${groupNpm}`);
  let res = await fetch(groupNpm);

  res = await res.json();

  // get the last one
  const foundVersion = res['dist-tags'][TAG ?? 'latest'];

  // increase x from 0.0.x to 0.0.x+1
  const version = foundVersion.split('.');
  version[2] = parseInt(version[2]) + 1;
  publishVersion = version.join('.');
  // greenLog(`ℹ️  Version "${publishVersion}" found on NPM\n`);
} catch (e) {
  yellowLog(
    "Couldn't get latest version from npm, will use the config version"
  );
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
