import { readCachedProjectGraph } from '@nrwl/devkit';
import { readFileSync, writeFileSync } from 'fs';
import chalk from 'chalk';

const graph = readCachedProjectGraph();
const nodes = graph.nodes;
const libs = [];

// Executing publish script: node path/to/forceLatestDependencies.mjs {mustContains}
const [, , mustContains] = process.argv;

Object.entries(nodes).forEach(node => {
    if( node[1].type !== 'lib' ) return;
    libs.push(node[1]);
})

libs.forEach(lib => {
    
    const packageJson = lib.data.root + '/' + 'package.json';
    console.log("packageJson:", packageJson);

    try {
        const json = JSON.parse(readFileSync(packageJson).toString());

        Object.entries(json?.dependencies).forEach((dep) => {

            const depName = dep[0];
            const depVersion = dep[1];

            const containsWord = new RegExp(mustContains, 'g').test(depName);

            if( containsWord ){
                json.dependencies[depName] = '*';
            }
        })

        console.log(json)
        
        writeFileSync(packageJson, JSON.stringify(json, null, 2));
    } catch (e) {
        console.error(
            chalk.bold.red(`Error reading package.json file from library build output.`)
        );
    }
})

// Object.keys(nodes).forEach((key, i) => {
//     nodes[key]
// })
// console.log("libs:", libs);