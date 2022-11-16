// #Usage: node tools/scripts/gen-doc.mjs

import { exit } from "process";
import { greenLog, listDirsRelative, readJsonFile, runCommand, writeJsonFile, getArgs, redLog, createDirs } from "./utils.mjs";
import * as liveServer from 'live-server'

const args = getArgs();

const FLAG = args[0];
const VERCEL_PROJECT_ID = 'prj_Itr1bdQXxXdn1x8zKOy35HmUxtLR';
const VERCEL_ORG_ID = 'team_BYVnuWp5MA5ra1UCzHa2XsCD';

if (!FLAG) {
    console.log("\n----- Available flags -----");
    console.log("1. --open to open the docs in browser");
    console.log("2. --push to build & push the docs to vercel");
    console.log('\n');
}
const TARGET = 'typedoc.json';

const jsonFile = await readJsonFile(TARGET);

const dirs = (await listDirsRelative('packages', false))
    .map((dir) => `./${dir}/src/index.ts`);

jsonFile.entryPoints = dirs;

await writeJsonFile(TARGET, jsonFile);

greenLog(`${TARGET} has been updated.`);

greenLog(`generating typedoc...`);
await runCommand(`yarn typedoc --options ${TARGET}`);

if (FLAG === '--open') {
    // await runCommand(`open ./docs/index.html`);
    liveServer.default.start({
        port: 4004, // Set the server port. Defaults to 8080.
        host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
        root: "./doc", // Set root directory that's being served. Defaults to cwd.
        open: false, // When false, it won't load your browser by default.
        ignore: 'scss,my/templates', // comma-separated string for paths to ignore
        file: "index.html", // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
        wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
        // mount: [['/components', './node_modules']], // Mount a directory to a route.
        logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
        // middleware: [function(req, res, next) { next(); }] // Takes an array of Connect-compatible middleware that are injected into the server middleware stack
    })
} else if (FLAG === '--push') {
    createDirs('doc/.vercel');
    writeJsonFile('doc/.vercel/project.json', { "projectId": VERCEL_PROJECT_ID, "orgId": VERCEL_ORG_ID });

    redLog(`If this is your first time running, you might have to run 'cd doc && vercel' to setup manually.`);
    greenLog("Trying to push to Vercel, takes about a minute. If not, there must be an error.");
    const link = await runCommand(`vercel --cwd=doc --prod`);
    console.log("Deployed:", link);
    exit();
} else {
    exit();
}