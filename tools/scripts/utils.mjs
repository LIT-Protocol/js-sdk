import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { exit } from 'process';
import readline from 'readline';
import { join } from 'path';
// import { promises as fs } from 'fs';

const rl = readline.createInterface(process.stdin, process.stdout);

// read the file and return as json
export async function readJsonFile(filename) {
    const filePath = path.join(process.cwd(), filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
}

export async function readFile(filename) {
    const filePath = path.join(process.cwd(), filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return fileContents;
}

// create a function to write to file
export async function writeJsonFile(filename, content) {
    const filePath = path.join(process.cwd(), filename);
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
}

export async function writeFile(filename, content) {
    const filePath = path.join(process.cwd(), filename);
    fs.writeFileSync(filePath, content);
}

// run a command
export async function runCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout.trim());
        });
    });
}

export const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
};

export const getArgs = () => {
    const args = process.argv.slice(2);
    return args;
}

export const redLog = (msg) => {
    console.log('\x1b[31m%s\x1b[0m', `- ${msg}`);
}

export const greenLog = (msg, noDash = false) => {
    if (noDash) {
        console.log('\x1b[32m%s\x1b[0m', msg);
    } else {
        console.log('\x1b[32m%s\x1b[0m', `- ${msg}`);
    }
}

export const question = (str, {
    yes,
    no,
}) => {
    return new Promise((resolve) => {
        return rl.question(`- ${str} [yes]/no:`, async (answer) => {
            if (answer === "no" || answer === "n") {
                no.call(answer);
            }

            if (answer === 'yes' || answer === 'y') {
                yes.call(answer);
            }

            // if nethers of the above, assume yes
            if (answer !== 'yes' && answer !== 'y' && answer !== 'no' && answer !== 'n') {
                redLog('Invalid answer, exiting...');
            }

            resolve();
        });
    });
}

export const getFiles = (path) => new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
        resolve(files)
    });
});

// wait for 1 second
export const wait = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
});

// recursively list all directories in a directory and return paths relative to root
export const listDirsRelative = async (dir) => {
    const root = join(dir, '..', '..');
    const files = await fs.promises.readdir(dir, { withFileTypes: true });
    const dirs = [];
    for (const file of files) {
        if (file.isDirectory()) {
            const path = join(dir, file.name);
            dirs.push(path);
            dirs.push(...(await listDirsRelative(path)));
        }
    }
    return dirs;
}

export const findImportsFromDir = async (dir) => {

    return new Promise(async (resolve, reject) => {
        const root = join(dir, '..', '..');

        const files = await fs.promises.readdir(root, { withFileTypes: true });

        const size = files.length;
        // console.log("size:", size)

        const packages = new Set();

        for (const file of files) {

            // get index
            const index = files.indexOf(file);

            if (file.isDirectory()) {
                const pkg = file.name;
                const pkgRoot = join(root, pkg);
                const pkgFiles = await fs.promises.readdir(pkgRoot, { withFileTypes: true });
                for (const pkgFile of pkgFiles) {

                    // if file name ends with .js, .ts, .mjs, .cjs
                    if (pkgFile.isFile() && (pkgFile.name.match(/\.([cm]?js|ts)$/))) {

                        const contents = await fs.promises.readFile(join(pkgRoot, pkgFile.name), 'utf-8');

                        // use regex to find all from 'package-name'
                        const regex = /from\s+['"]([^'"]+)['"]/g;
                        let match;
                        while ((match = regex.exec(contents)) !== null) {
                            const pkg = match[1];
                            packages.add(pkg);
                        }

                    }
                }
            }

            if (index === size - 1) {
                resolve(packages);
            }
        }

        return packages;
    })
}