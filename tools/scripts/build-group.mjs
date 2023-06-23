import {
  childRunCommand,
  getArgs,
  greenLog,
  redLog,
  validateGroupIsInConfig,
} from './utils.mjs';

const args = getArgs();
const group = args[0];

if (!group) {
  redLog(
    `You must provide a group name and it must exist in the lit.group.json file.`
  );
  process.exit();
}

validateGroupIsInConfig(group);

greenLog(`✅ Selected "${group}" group.`, true);

// making sure no directories are empty
await childRunCommand(`yarn tools check --no-empty-directories=true`);

// tsConfig.json path should always be '@lit-protocol/': ['packages//src']
await childRunCommand(`yarn tools fixTsConfig`);

// delete all relevant packages in dist folder (those that has group=groupName in package.json)
await childRunCommand(
  `yarn node ./tools/scripts/remove-group-packages.mjs ${group}`
);
// remove symlink from the group packages
await childRunCommand(`yarn tools --remove-local-dev ${group}`);

// yarn tools --build --packages
await childRunCommand(`yarn tools --build --packages --group=${group}`);

// yarn tools --buildTestApps
await childRunCommand(`yarn tools --buildTestApps`);

// yarn tools --setup-local-dev
await childRunCommand(`yarn tools --setup-local-dev --group=${group}`);

// yarn postBuild:mapDepsToDist
// await childRunCommand(`yarn postBuild:mapDepsToDist`);

// yarn gen:readme
// await childRunCommand(`yarn gen:readme`);

// yarn build:verify
// await childRunCommand(`yarn build:verify`);

process.exit();
