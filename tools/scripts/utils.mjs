import fs from 'fs';
import path from 'path';
import { exec, spawn } from 'child_process';
import { exit } from 'process';
import readline from 'readline';
import { join } from 'path';
// import { promises as fs } from 'fs';

const rl = readline.createInterface(process.stdin, process.stdout);

/**
 * replaceAutogen - Replaces the content between the specified start and end delimiters
 * with new content.
 *
 * @param {string} startDelimiter - The string that marks the start of the content to be replaced.
 * @param {string} endDelimiter - The string that marks the end of the content to be replaced.
 * @param {string} newContent - The new content that will replace the old content.
 *
 * @returns {string} The input string with the content between the start and end
 * delimiters replaced with the new content.
 */

 export const replaceAutogen = ({
    oldContent,
    startsWith = "// ----- autogen:imports:start  -----",
    endsWith = "// ----- autogen:imports:end  -----",
    newContent,
}) => {

    // Find the start and end indices of the content to be replaced.
    const startIndex = oldContent.indexOf(startsWith) + startsWith.length;
    const endIndex = oldContent.indexOf(endsWith);

    // Extract the content to be replaced.
    const _oldContent = oldContent.substring(startIndex, endIndex);

    // Replace the old content with the new content.
    const newStr = oldContent.replace(_oldContent, `\n${newContent}\n`);

    return newStr;
}

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

/**
 * Asynchronously runs the specified command and returns the output.
 *
 * @param {string} command The command to run.
 *
 * @return {Promise<string>} A promise that resolves with the output of the command.
 *
 * @throws {Error} If the command fails to run.
 */
export async function childRunCommand(command) {
    return new Promise((resolve, reject) => {
        const child = exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout.trim());
        });
        child.stdout.on('data', (data) => {
            console.log(data.toString().replace(/\n$/, ''));
        });

        child.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        child.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            // exit();
        });

    });
}


export const spawnCommand = (command, args, options = {}) => {
    
    // Use the spawn() function to run the command in a child process
    const child = spawn(command, args, options);

    // Handle child process output
    child.stdout.on("data", data => {
        console.log(`child stdout:\n${data}`);
    });

    child.stderr.on("data", data => {
        console.error(`child stderr:\n${data}`);
    });

    child.on("exit", code => {
        console.log(`child process exited with code ${code}`);
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

export const redLog = (msg, noDash = false) => {
    if (noDash) {
        console.log('\x1b[31m%s\x1b[0m', msg);
    } else {
        console.log('\x1b[31m%s\x1b[0m', `- ${msg}`);
    }
}

export const greenLog = (msg, noDash = false) => {
    if (noDash) {
        console.log('\x1b[32m%s\x1b[0m', msg);
    } else {
        console.log('\x1b[32m%s\x1b[0m', `- ${msg}`);
    }
}

export const yellowLog = (msg, noDash = false) => {
    if (noDash) {
        console.log('\x1b[33m%s\x1b[0m', msg);
    } else {
        console.log('\x1b[33m%s\x1b[0m', `- ${msg}`);
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
export const listDirsRelative = async (dir, recursive = true) => {
    const root = join(dir, '..', '..');
    const files = await fs.promises.readdir(dir, { withFileTypes: true });
    const dirs = [];
    for (const file of files) {
        if (file.isDirectory()) {
            const path = join(dir, file.name);
            dirs.push(path);

            if (recursive) {
                dirs.push(...(await listDirsRelative(path)));
            }

        }
    }
    return dirs;
}

export const findImportsFromDir = async (dir) => {

    const files = await fs.promises.readdir(dir, { withFileTypes: true });

    const packages = [];

    await asyncForEach(files, async (file) => {

        if (!file.isDirectory()) {
            const filePath = join(dir, file.name);
            // greenLog(`    - Scanning => ${filePath}`, true);

            const contents = await fs.promises.readFile(filePath, 'utf-8');

            // use regex to find all from 'package-name'
            const regex = /from\s+['"]([^'"]+)['"]/g;
            let match;
            while ((match = regex.exec(contents)) !== null) {
                const pkg = match[1];
                packages.push(pkg);
            }
        }
    });

    return packages;
}

export const createDirs = (path) => {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
    }
}