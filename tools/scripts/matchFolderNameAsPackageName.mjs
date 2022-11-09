import { readCachedProjectGraph } from '@nrwl/devkit';
import chalk from 'chalk';
import { exit } from 'process';
import { getArgs, greenLog, readJsonFile, redLog, writeJsonFile } from './utils.mjs';
const graph = readCachedProjectGraph();
const nodes = graph.nodes;

const run = async () => new Promise((resolve) => {
    Object.entries(nodes).forEach(async (node, i) => {

        if (node[1].data.projectType === 'library') {
    
            const packageJsonPath = 'dist/packages/' + node[1].name + '/' + 'package.json';
    
            try {
                const packageJson = await readJsonFile(packageJsonPath);
                // console.log(packageJson)
                // -- create vanilla version
                let vanillaPackageJson = packageJson;
                delete vanillaPackageJson.main;
                delete vanillaPackageJson.typings;
                delete vanillaPackageJson.peerDependencies;
    
                vanillaPackageJson.name += '-vanilla';
                vanillaPackageJson.publishConfig.directory += '-vanilla';
    
                let newPath = 'dist/packages/' + node[1].name + '-vanilla/package.json';
                greenLog(`Writing vanilla package.json to ${newPath}`);
                await writeJsonFile(newPath, vanillaPackageJson);
    
            } catch (e) {
                redLog(`skipping '${packageJsonPath}', because it does not exist.`);
            }
        }

        if (i === Object.entries(nodes).length - 1) {
            resolve();
        }
    })
});

await run();
exit();