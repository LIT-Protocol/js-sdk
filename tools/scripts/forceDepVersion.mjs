import devkit from '@nx/devkit';
import { readFileSync, writeFileSync } from 'fs';
import chalk from 'chalk';

const graph = devkit.readCachedProjectGraph();
const nodes = graph.nodes;
const libs = [];

const arg = (argString) => argString.split('=')[1];

// Executing publish script: node path/to/forceLatestDependencies.mjs {mustContains} --workspace={workspace}
const [, , mustContains, workspace, version] = process.argv;

const _mustContains = arg(mustContains);
const _workspace = arg(workspace) ?? 'lib'; // default: lib
const _version = arg(version) ?? '*';

console.log('====== Getting Ready ======');
console.log(chalk.bold.green(`- Dependency must contain =>`), _mustContains);
console.log(chalk.bold.green(`- Targeted workspace =>`), _workspace);
console.log(chalk.bold.green(`- Targeted Version =>`), _version);
console.log('');

Object.entries(nodes).forEach((node) => {
  if (node[1].type !== _workspace) return;
  libs.push(node[1]);
});

libs.forEach((lib, i) => {
  const packageJson = lib.data.root + '/' + 'package.json';
  console.log(`(${i}) FOUND: ${packageJson}`);

  let json;

  try {
    json = JSON.parse(readFileSync(packageJson).toString());
  } catch (e) {
    console.error(
      chalk.bold.red(
        `Error reading package.json file from library build output.`
      )
    );
  }

  try {
    Object.entries(json?.dependencies).forEach((dep) => {
      const depName = dep[0];

      const containsWord = new RegExp(_mustContains, 'g').test(depName);

      if (containsWord) {
        if (json.dependencies[depName] == _version) {
          console.log(chalk.bold.green('- Nothing to change.'));
          return;
        }
        console.log(
          chalk.bold.green(
            `- Updated "${depName}": "${json.dependencies[depName]}" => "${depName}": "${_version}"`
          )
        );
        json.dependencies[depName] = _version.toString();
      }
    });

    writeFileSync(packageJson, JSON.stringify(json, null, 2));
  } catch (e) {
    console.log(
      chalk.bold.green(`- Cannot find dependencies contains ${_mustContains}`)
    );
  }
  console.log('');
});
