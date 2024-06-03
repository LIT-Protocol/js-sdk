// #Usage: node tools/scripts/gen-doc.mjs

import { exit } from 'process';
import {
  greenLog,
  listDirsRecursive,
  readJsonFile,
  runCommand,
  writeJsonFile,
  getArgs,
  redLog,
  createDirs,
} from './utils.mjs';
import * as liveServer from 'live-server';
import inquirer from 'inquirer';

const VERCEL_PROJECT = {
  V5: 'prj_Xq6tl0JfFOmWlCLlMkh0B5rzFHoK',
  V6: 'prj_Ed96nvLrMCQgjVN252BmnHD1kRy4',
};

const args = getArgs();

const FLAG = args[0];
const VERCEL_ORG_ID = 'team_BYVnuWp5MA5ra1UCzHa2XsCD';

if (!FLAG) {
  console.log('\n----- Available flags -----');
  console.log('1. --preview to open the docs in browser');
  console.log('2. --push to build & push the docs to vercel');
  console.log('\n');
}

async function selectProject() {
  const { project } = await inquirer.prompt([
    {
      type: 'list',
      name: 'project',
      message: 'Select the Vercel project to push to:',
      choices: [
        { name: 'V5', value: VERCEL_PROJECT.V5 },
        { name: 'V6', value: VERCEL_PROJECT.V6 },
      ],
    },
  ]);
  return project;
}

const TARGET = 'typedoc.json';

const jsonFile = await readJsonFile(TARGET);

const dirs = (await listDirsRecursive('packages', false)).map(
  (dir) => `./${dir}/src/index.ts`
);

jsonFile.entryPoints = dirs;

await writeJsonFile(TARGET, jsonFile);

greenLog(`${TARGET} has been updated.`);

greenLog(`generating typedoc...`);
await runCommand(`yarn typedoc --options ${TARGET}`);

if (FLAG === '--preview') {
  // await runCommand(`open ./docs/index.html`);
  liveServer.default.start({
    port: 4004, // Set the server port. Defaults to 8080.
    host: '0.0.0.0', // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
    root: './doc', // Set root directory that's being served. Defaults to cwd.
    open: false, // When false, it won't load your browser by default.
    ignore: 'scss,my/templates', // comma-separated string for paths to ignore
    file: 'index.html', // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
    wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
    // mount: [['/components', './node_modules']], // Mount a directory to a route.
    logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
    // middleware: [function(req, res, next) { next(); }] // Takes an array of Connect-compatible middleware that are injected into the server middleware stack
  });
} else if (FLAG === '--push') {
  const projectId = await selectProject(); // Prompt user to select a project

  createDirs('doc/.vercel');
  writeJsonFile('doc/.vercel/project.json', {
    projectId: projectId,
    orgId: VERCEL_ORG_ID,
  });

  redLog(
    `If this is your first time running, you might have to run 'cd doc && vercel' to setup manually.`
  );
  greenLog(
    'Trying to push to Vercel, takes about a minute. If not, there must be an error.'
  );
  const link = await runCommand(`cd doc && vercel --prod`);
  console.log('Deployed:', link);
  exit();
} else {
  exit();
}
