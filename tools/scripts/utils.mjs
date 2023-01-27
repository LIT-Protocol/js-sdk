import fs from 'fs';
import path from 'path';
import { exec, spawn } from 'child_process';
import { exit } from 'process';
import readline from 'readline';
import { join } from 'path';
import events from 'events'
import util from 'util';
const eventsEmitter = new events.EventEmitter();

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
        }, {
            env: {
                ...process.env,
                FORCE_COLOR: true,
            }
        });
        child.stdout.on('data', (data) => {
            console.log(`${data.toString().replace(/\n$/, '')}`);
        });

        child.stderr.on('data', (data) => {
            console.warn(`${data.toString().replace(/\n$/, '')}`);
        });

        child.on('close', (code) => {
            // console.log(`child process exited with code ${code}`);
            // exit();
        });

    });
}


export const spawnCommand = (command, args, options = {}, options2 = {
    logExit: true,
}) => {

    // Use the spawn() function to run the command in a child process
    const child = spawn(command, args, {
        ...options, env: {
            ...process.env,
            FORCE_COLOR: true,
        }
    });

    // Handle child process output
    child.stdout.on("data", data => {
        console.log(`${data.toString().replace(/\n$/, '')}`);
    });

    child.stderr.on("data", data => {
        console.log(`${data.toString().replace(/\n$/, '')}`);
    });

    child.on("exit", code => {
        if (options2.logExit) {
            console.log(`child process exited with code ${code}`);
        }
    });
}

export const spawnListener = (commands, callback, prefix = '', color = 31) => {

    let _commands = commands.split(" ");
    // let eventName = _commands.join('-');

    // make commands to pass to spawn
    const command = _commands[0];
    const args = _commands.slice(1);

    // Use the spawn() function to run the command in a child process
    let bob = spawn(command, args, {
        env: {
            ...process.env,
            FORCE_COLOR: true,
        }
    });

    bob.on('exit', (exitCode) => {
        if (parseInt(exitCode) !== 0) {
            // handle non-exit code
            redLog(`child process exited with code ${exitCode} when running ${command}`);

            if (callback?.onExit) {
                callback?.onExit(exitCode);
            }
            exit();
        }
        // eventsEmitter.emit(eventName);

        if (callback?.onDone) {
            callback?.onDone(exitCode);
        }
    })

    // Handle child process output
    // bob.stdout.pipe(process.stdout);
    // randomize the color

    if (!color) {
        color = Math.floor(Math.random() * 6) + 31;
    }

    bob.stdout.on('data', (data) => {
        console.log(`\x1b[${color}m%s\x1b[0m: %s`, prefix, data.toString().replace(/\n$/, ''));
    })

    // foward the key to the child process
    process.stdin.on('data', (key) => {
        bob.stdin.write(key);
    })

    return bob;
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
export const listDirsRecursive = async (dir, recursive = true) => {
    const root = join(dir, '..', '..');
    const files = await fs.promises.readdir(dir, { withFileTypes: true });
    const dirs = [];
    for (const file of files) {
        if (file.isDirectory()) {
            const path = join(dir, file.name);
            dirs.push(path);

            if (recursive) {
                dirs.push(...(await listDirsRecursive(path)));
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

export const findStrFromDir = async (dir, str) => {

    const files = await fs.promises.readdir(dir, { withFileTypes: true });

    const paths = [];

    await asyncForEach(files, async (file) => {

        if (!file.isDirectory()) {
            const filePath = join(dir, file.name);
            // greenLog(`    - Scanning => ${filePath}`, true);

            const contents = await fs.promises.readFile(filePath, 'utf-8');

            // use regex to find if content has str
            const regex = new RegExp(str, 'g');

            let match;
            while ((match = regex.exec(contents)) !== null) {
                paths.push(filePath);
            }
        }
    });

    const uniquePaths = [...new Set(paths)];

    return uniquePaths;
}

export const createDirs = (path) => {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
    }
}
export const customSort = (arr, orderJson) => {
    arr.sort((a, b) => {
        if (orderJson[a] !== undefined && orderJson[b] !== undefined) {
            return orderJson[a] - orderJson[b];
        } else if (orderJson[a] !== undefined) {
            return -1;
        } else if (orderJson[b] !== undefined) {
            return 1;
        } else {
            return 0;
        }
    });

    return arr;
}

// create a function that recursively find all files content contains a string 'hello'
export const findFilesWithContent = async (dir, content) => {
    const files = await fs.promises
        .readir(dir, { withFileTypes: true })
        .catch((err) => {
            console.log(err);
        }
        );

    const foundFiles = [];

    await asyncForEach(files, async (file) => {
        if (!file.isDirectory()) {
            const filePath = join(dir, file.name);
            const contents = await fs.promises.readFile
                (filePath, 'utf-8')
                .catch((err) => {
                    console.log(err);
                }
                );

            if (contents.includes(content)) {
                foundFiles.push(filePath);
            }
        } else {
            const path = join(dir, file.name);
            foundFiles.push(...(await findFilesWithContent(path, content)));
        }
    });

    return foundFiles;
}

export const replaceFileContent = async (path, oldContent, newContent) => {
    const file = path;
    let content = await readFile(file);
    content = content.replaceAll(oldContent, newContent);
    await writeFile(file, content);
    return content;
}

/**
 * Examples:
 * 1. prefixPathWithDir('./src/index.js', 'components') => './components/src/index.js'
 * 2. prefixPathWithDir('src/index.js', 'components') => './components/src/index.js'
 */
export const prefixPathWithDir = (path, dirName) => {
    if (path.slice(0, 2) === './') {
        return `./${dirName}/${path.slice(2)}`;
    } else {
        return `./${dirName}/${path}`;
    }
};

// lerna.json version x.x.x must be greater than each individual package.json version x.x.x
export const versionChecker =  (pkg, lernaVersion) => {

const version = pkg.version;

  // version cannot be the same as lerna.json version
  if (version === lernaVersion) {

    return { status: 500, message: `Skipping ${pkg.name} as version is the same as lerna.json version` };
  }

    // lerna.json version x.x.x must be greater than package.json version x.x.x
    const lernaVersionArr = lernaVersion.split('.');
    const versionArr = version.split('.');
    const lernaVersionMajor = parseInt(lernaVersionArr[0]);
    const lernaVersionMinor = parseInt(lernaVersionArr[1]);
    const lernaVersionPatch = parseInt(lernaVersionArr[2]);
    const versionMajor = parseInt(versionArr[0]);
    const versionMinor = parseInt(versionArr[1]);
    const versionPatch = parseInt(versionArr[2]);
  
    if (lernaVersionMajor < versionMajor) {
      return { status: 500, message: `Skipping ${pkg.name} as lerna.json version is less than package.json version` };
    }

    if (lernaVersionMajor === versionMajor && lernaVersionMinor < versionMinor) {
        return { status: 500, message: `Skipping ${pkg.name} as lerna.json version is less than package.json version` };
    }

    if (
        lernaVersionMajor === versionMajor &&
        lernaVersionMinor === versionMinor &&
        lernaVersionPatch <= versionPatch
    ) {
        return { status: 500, message: `Skipping ${pkg.name} as lerna.json version is less than package.json version` };
    }

    return { status: 200, message: `${pkg.name}@${version} => @${lernaVersion}`};

}