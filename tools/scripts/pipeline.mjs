// scripts/publish.mjs
import readline from 'readline';
import { spawn } from 'child_process';
import fs from 'fs';

// Read lerna.json
const lernaJson = JSON.parse(fs.readFileSync('lerna.json', 'utf-8'));
const version = lernaJson.version;

const commands = [
  // 'yarn bump',
  // 'yarn build',
  // 'yarn test:unit',
  // 'yarn test:e2e',
  // 'yarn gen:docs --push',
  // 'yarn publish:packages',
  `git add *`,
  `git commit -m "Published version ${version}"`,
  'git push',
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function runCommand(index = 0) {
  if (index >= commands.length) {
    rl.close();
    return;
  }

  rl.question(`Press Enter to execute: ${commands[index]}\n`, () => {
    const [command, ...args] = commands[index].split(' ');

    const childProcess = spawn(command, args, { stdio: 'inherit' });

    childProcess.on('error', (error) => {
      console.error(`Execution error: ${error}`);
    });

    childProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Process exited with code: ${code}`);
        return;
      }
      runCommand(index + 1);
    });
  });
}

runCommand();
