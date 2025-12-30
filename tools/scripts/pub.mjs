// # Usage: node tools/scripts/pub.mjs
// import { exec } from 'child_process';

import { exit } from 'process';
import {
  asyncForEach,
  childRunCommand,
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

const TEMP_TAG = 'temp-7';
const REMOVE_TEMP_TAG = true;
const TAG_OVERRIDES = new Map(
  [
    '@lit-protocol/access-control-conditions',
    '@lit-protocol/auth-helpers',
    '@lit-protocol/constants',
    '@lit-protocol/logger',
    '@lit-protocol/types',
    '@lit-protocol/crypto',
    '@lit-protocol/wasm',
    '@lit-protocol/wrapped-keys-lit-actions',
    '@lit-protocol/wrapped-keys',
  ].map((pkgName) => [pkgName, TEMP_TAG])
);

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

const resolvePublishTag = (pkgName) => {
  if (OPTION === '--tag') {
    return VALUE;
  }

  if (OPTION === '--prod') {
    return TAG_OVERRIDES.get(pkgName) || null;
  }

  return null;
};

const shouldRemoveTempTag = (pkgName, tag) =>
  REMOVE_TEMP_TAG && tag === TEMP_TAG && TAG_OVERRIDES.has(pkgName);

// read lerna.json version
const lerna = await readJsonFile('lerna.json');
const lernaVersion = lerna.version;

let dirs = await listDirsRecursive('dist/packages', false);

console.log('Ready to publish the following packages:');

let publishVersion = null;

await asyncForEach(dirs, async (dir) => {
  // read the package.json file
  const pkg = await readJsonFile(`${dir}/package.json`);

  greenLog(`${pkg.name} => ${pkg.version}`);

  publishVersion = pkg.version;

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
    : `PRODUCTION${
        OPTION === '--prod' && TAG_OVERRIDES.size > 0
          ? ` (overrides: ${TEMP_TAG}${
              REMOVE_TEMP_TAG ? ', will remove tag after publish' : ''
            } for ${[...TAG_OVERRIDES.keys()].join(', ')})`
          : ''
      }`;

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
    const failures = [];
    const tempTagRemovals = [];

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
          pkg2.version = lernaVersion;
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
        pkg.version = lernaVersion;
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
            exitCallback: (code) => {
              counter++;
              if (code !== 0) {
                failures.push({ dir, code, tag: VALUE });
              } else if (shouldRemoveTempTag(pkg.name, VALUE)) {
                tempTagRemovals.push({ pkgName: pkg.name, tag: VALUE });
              }
              // console.log(`${dir} published with tag ${VALUE}`)
            },
          }
        );
      }

      if (OPTION === '--prod') {
        const publishTag = resolvePublishTag(pkg.name);
        if (publishTag) {
          greenLog(`Publishing ${dir} with tag ${publishTag}`);
        }

        spawnCommand(
          'npm',
          publishTag
            ? ['publish', '--access', 'public', '--tag', publishTag]
            : ['publish', '--access', 'public'],
          {
            cwd: dir,
          },
          {
            logExit: false,
            exitCallback: (code) => {
              counter++;
              if (code !== 0) {
                failures.push({ dir, code, tag: publishTag ?? 'latest' });
              } else if (shouldRemoveTempTag(pkg.name, publishTag)) {
                tempTagRemovals.push({
                  pkgName: pkg.name,
                  tag: publishTag,
                });
              }
              // console.log(`${dir} published with tag ${VALUE}`)
            },
          }
        );
      }
    });

    while (true) {
      // wait a few secs to check again if all packages are published
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (counter >= dirs.length) {
        if (tempTagRemovals.length > 0) {
          greenLog(`Removing temporary tags...`);
          await asyncForEach(tempTagRemovals, async ({ pkgName, tag }) => {
            try {
              await childRunCommand(`npm dist-tag rm ${pkgName} ${tag}`);
            } catch (error) {
              failures.push({
                dir: pkgName,
                code: 'dist-tag-rm-failed',
                tag,
              });
            }
          });
        }

        if (failures.length > 0) {
          redLog(
            `Publish finished with ${failures.length} failure(s):\n${failures
              .map(
                (failure) =>
                  `- ${failure.dir} (tag ${failure.tag}, exit ${failure.code})`
              )
              .join('\n')}`,
            true
          );
          exit(1);
        } else {
          greenLog('🎉 Publish complete!', true);
          exit(0);
        }
      }
    }
  },
  no: () => {
    redLog('Publish cancelled', true);
    exit(0);
  },
});
