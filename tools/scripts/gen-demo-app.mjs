import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { redLog } from './utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * This script clones the nextjs-demo-template directory, allows the user to set a new name for the project,
 * and changes the package.json name accordingly.
 *
 * Usage: node gen-demo-app.mjs --name=<name>
 */

// Parse arguments
const args = process.argv.slice(2);
const NEW_NAME = args.find((arg) => arg.startsWith('--name'))?.split('=')[1];
if (!NEW_NAME) {
  redLog('Please provide a new name for the project using --name=<name>');
  process.exit(1);
}

// Define directories
const TEMPLATE_DIR = path.join(__dirname, 'nextjs-demo-template');
const APPS_DIR = path.join(process.cwd(), 'apps'); // Changed from __dirname to process.cwd()
const NEW_PROJECT_DIR = path.join(APPS_DIR, NEW_NAME);

// Check if directory already exists
if (fs.existsSync(NEW_PROJECT_DIR)) {
  redLog(
    `The directory ${NEW_PROJECT_DIR} already exists. Please choose a different name.`
  );
  process.exit(1);
}

// Clone template to new project directory
execSync(`cp -r ${TEMPLATE_DIR} ${NEW_PROJECT_DIR}`);

// Update package.json name
const packageJsonPath = path.join(NEW_PROJECT_DIR, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
packageJson.name = NEW_NAME;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Run yarn install in the project directory
console.log(`\n📝 Available commands:\n\n`);
console.log(`Project ${NEW_NAME} has been created in the ./apps directory.`);
console.log(
  `You can start the project by navigating to ./apps/${NEW_NAME} and running yarn install and then yarn dev.\n\n
  
  In order to use the monorepo packages, you need to first build the packages via yarn build.

  Then, run run ./npm-link.sh --link lit-node-client lit-auth-client ...

  make sure you've set correct permissions for the script by running chmod +x ./npm-link.sh

  Then, in the new project, run npm link @lit-js-sdk/lit-node-client @lit-js-sdk/lit-auth-client ...
  `
);
process.exit();
