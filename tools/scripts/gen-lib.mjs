// Usage: node tools/scripts/gen-lib.mjs

import { runCommand, getArgs, writeJsonFile, question, greenLog, wait } from './utils.mjs';
import { readCachedProjectGraph } from '@nrwl/devkit';
import { exit } from 'process';
const args = getArgs();
const name = args[0];

let alreadyExists = false;

try {
    await runCommand(`yarn nx generate @nrwl/js:library --name=${name}`);
} catch (e) {
    greenLog(`${name} already exists.`);
    alreadyExists = true;
}

await wait(1000);

const createBuild = (name) => {
    return {
        "build": {
            "executor": "nx:run-commands",
            "options": {
                "command": `yarn build:target ${name}`
            }
        },
    }
}

const createBuildWeb = (name, { globalPrefix = 'LitJsSdk' }) => {

    const camelCase = name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

    return {
        "_buildWeb": {
            "executor": "@websaam/nx-esbuild:package",
            "options": {
                "globalName": `${globalPrefix}_${camelCase}`,
                "outfile": `dist/packages/${name}-vanilla/${name}.js`,
                "entryPoints": [`./packages/${name}/src/index.ts`],
                "define": {
                    "process.env.NODE_DEBUG": "false"
                },
                "plugins": [
                    {
                        "package": "esbuild-node-builtins",
                        "function": "nodeBuiltIns"
                    }
                ]
            }
        }
    }
}

const go = async () => {

    const graph = readCachedProjectGraph();
    const nodes = graph.nodes;

    const project = nodes[name].data;


    delete project.files;
    delete project.root;
    delete project.targets.build.dependsOn;

    project.targets['_buildTsc'] = project.targets.build;
    project.targets['_buildWeb'] = createBuildWeb(name, { globalPrefix: 'LitJsSdk' })._buildWeb;
    project.targets['build'] = createBuild(name).build;

    // move 'lint' and 'test' objects to the end
    const { lint, test, ...rest } = project.targets;
    project.targets = { ...rest, lint, test };

    const writePath = project.sourceRoot.split('src')[0] + 'project.json';

    await writeJsonFile(writePath, project);
}

if (!alreadyExists) {
    await go();
    exit();
};

await question(`Do you want to update ${name} project.json?`, {
    yes: async () => {
        await go();
        exit();
    },
    no: () => {
        exit();
    }
});

exit();