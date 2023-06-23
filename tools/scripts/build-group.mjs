import {
  childRunCommand,
  getArgs,
  getFlag,
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

process.exit();
