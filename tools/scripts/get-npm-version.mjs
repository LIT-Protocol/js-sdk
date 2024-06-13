import { exit } from 'process';
import {
  greenLog,
  readFile,
  readJsonFile,
  redLog,
  writeFile,
  writeJsonFile,
} from './utils.mjs';

export async function versionFunc() {
  const args = process.argv.slice(2);
  const TAG = args.find((arg) => arg.startsWith('--tag'))?.split('=')[1];

  greenLog(`Getting latest version from npm ${TAG}...`);

  let res = await fetch(
    'https://registry.npmjs.org/@lit-protocol/lit-node-client'
  );

  res = await res.json();

  // get the last one
  let currentVersion;

  if (!TAG) {
    currentVersion = Object.keys(res.time).pop();
  } else {
    currentVersion = res['dist-tags'][TAG];
  }

  const lernaJson = await readJsonFile(`lerna.json`);
  const versionTs = (
    await readFile(`packages/constants/src/lib/version.ts`)
  ).match(/'([^']+)'/)[1];

  greenLog(`📦 Current NPM version: ${currentVersion}`, true);
  greenLog(`➡ Current lerna.json version: ${lernaJson.version}`, true);
  greenLog(`➡ Current version.ts version: ${versionTs}`, true);

  // if lerna.json and version.ts patch version is greater than currentVersion
  // then console.log that we can upgrade
  const lernaVersion = lernaJson.version.split('.');
  const versionTsVersion = versionTs.split('.');
  const currentVersionVersion = currentVersion.split('.');
  if (
    parseInt(lernaVersion[2]) === parseInt(currentVersionVersion[2]) ||
    parseInt(versionTsVersion[2]) === parseInt(currentVersionVersion[2])
  ) {
    greenLog(
      `Both versions are the same. You can bump your local version`,
      true
    );
  }

  const OPT = args[1];

  const supportedOptions = ['--major', '--minor', '--patch', '--custom'];

  if (
    !OPT ||
    OPT === '' ||
    OPT === '--help' ||
    !supportedOptions.includes(OPT)
  ) {
    greenLog(
      `
            Usage: node tools/scripts/tools.mjs --v [options]
                [options]:
                    --major: increase major version
                    --minor: increase minor version
                    --patch: increase patch version
                    --custom: run custom tests
            `,
      true
    );
    exit();
  }

  let newVersion;

  if (OPT === '--patch') {
    // increase x from 0.0.x to 0.0.x+1
    const version = currentVersion.split('.');
    version[2] = parseInt(version[2]) + 1;
    const patchVersion = version.join('.');
    greenLog(`Patch Version: ${patchVersion}`);
    newVersion = patchVersion;
  }

  if (OPT === '--minor') {
    // increase x from 0.x.0 to 0.x+1.0
    const version = currentVersion.split('.');
    version[1] = parseInt(version[1]) + 1;
    version[2] = 0;
    const minorVersion = version.join('.');
    greenLog(`Minor Version: ${minorVersion}`);
    newVersion = minorVersion;
  }

  if (OPT === '--major') {
    // increase x from x.0.0 to x+1.0.0
    const version = currentVersion.split('.');
    version[0] = parseInt(version[0]) + 1;
    version[1] = 0;
    version[2] = 0;
    const majorVersion = version.join('.');
    greenLog(`Major Version: ${majorVersion}`);
    newVersion = majorVersion;
  }

  if (OPT === '--custom') {
    // increase x from x.0.0 to x+1.0.0
    const version = args[2];
    greenLog(`Custom Version: ${version}`);
    newVersion = version;
  }

  greenLog(`New version: ${newVersion}`);

  const OPT2 = args[2];
  // update lerna.json
  try {
    const lernaJson = await readJsonFile(`lerna.json`);
    lernaJson.version = newVersion;

    if (OPT2 !== '--dry-run') {
      await writeJsonFile(`lerna.json`, lernaJson);
    } else {
      greenLog(`Dry run, not updating lerna.json`);
      console.log(lernaJson);
    }
  } catch (e) {
    redLog(e);
    exit();
  }

  // update version.ts in constants
  try {
    const versionTsNew = `export const version = '${newVersion}';`;

    if (OPT2 !== '--dry-run') {
      await writeFile(`packages/constants/src/lib/version.ts`, versionTsNew);
    } else {
      greenLog(`Dry run, not updating packages/constants/src/lib/version.ts`);
      console.log(versionTsNew);
    }
  } catch (e) {
    redLog(e);
    exit();
  }

  exit();
}

versionFunc();
