import { exit } from 'process';
import {
    childRunCommand,
    customSort,
    findImportsFromDir,
    getArgs,
    greenLog,
    listDirsRecursive,
    readFile,
    readJsonFile,
    redLog,
    replaceAutogen,
    spawnCommand,
    spawnListener,
    writeFile,
} from './utils.mjs';

const args = getArgs();

const OPTION = args[0];

if (!OPTION || OPTION === '' || OPTION === '--help') {
    greenLog(
        `
        Usage: node tools/scripts/tools.mjs [option][...args]
        Options:
            --help: show this help
            --create: create a new app
            --path: a directory to run commands in
            --test: run tests
            --find: different search options
            --publish: publish to npm
            --yalc: publish to yalc
            --build: build the project
    `,
        true
    );
    exit();
}

if (OPTION === '--create') {
    let APP_TYPE = args[1];

    if (!APP_TYPE || APP_TYPE === '' || APP_TYPE === '--help') {
        greenLog(
            `
        Usage: node tools/scripts/tools.mjs --create [app-type]
        [app-type]: the type of app to create
        Options:
        --react: create a react app
        --html: create a html app
        --node: create a node app
        `,
            true
        );
        exit();
    }

    let APP_NAME = args[2];
    const TYPE = args[3];

    if (APP_TYPE === '--react') {
        if (!TYPE || TYPE === '' || TYPE === '--help') {
            greenLog(
                `
            Usage: node tools/scripts/tools.mjs --create --react [app_name] [type]
            [type]: the type of react app to create
            Options:
            --demo: prepend 'demo' and append '-react' to the app name
            `,
                true
            );
        }

        if (TYPE === '--demo') {
            APP_NAME = `demo-${APP_NAME}-react`;
        }

        const INSTALL_PATH = `apps/${APP_NAME}`;

        await childRunCommand(
            `git clone https://github.com/LIT-Protocol/demo-project-react-template ${INSTALL_PATH}`
        );

        await writeFile(
            `${INSTALL_PATH}/src/App.js`,
            replaceAutogen({
                oldContent: await readFile(`${INSTALL_PATH}/src/App.js`),
                startsWith: '// ----- autogen:app-name:start  -----',
                endsWith: '// ----- autogen:app-name:end  -----',
                newContent: `const [appName, setAppName] = useState('${APP_NAME}');`,
            })
        );

        const indexHtml = await readFile(`${INSTALL_PATH}/public/index.html`);
        const newHtml = indexHtml.replace('Demo', `Demo: ${APP_NAME}`);
        await writeFile(`${INSTALL_PATH}/public/index.html`, newHtml);

        await childRunCommand(`rm -rf ${INSTALL_PATH}/.git`);

        const packageJson = await readJsonFile(`${INSTALL_PATH}/package.json`);
        packageJson.name = APP_NAME;

        // generate a port number between 4100 and 4200
        const port = Math.floor(Math.random() * 100) + 4100;
        packageJson.scripts.start = `PORT=${port} react-scripts start`;

        await writeFile(
            `${INSTALL_PATH}/package.json`,
            JSON.stringify(packageJson, null, 2)
        );

        await childRunCommand(`cd ${INSTALL_PATH} && yarn install`);

        greenLog(`Creating a project.json for nx workspace`);

        const projectJson = await readFile(`tools/scripts/project.json.template`);
        const newProjectJson = projectJson
            .replaceAll('PROJECT_NAME', APP_NAME)
            .replaceAll('PROJECT_PATH', `apps/${APP_NAME}`)
            .replaceAll('PROJECT_PORT', port);

        await writeFile(`${INSTALL_PATH}/project.json`, newProjectJson);

        greenLog('Adding project to nx workspace');

        const workspaceJson = await readJsonFile(`workspace.json`);

        workspaceJson.projects[APP_NAME] = INSTALL_PATH;

        await writeFile(`workspace.json`, JSON.stringify(workspaceJson, null, 2));

        greenLog('Done!');
    }

    if (APP_TYPE == '--html') {
        if (!TYPE || TYPE === '' || TYPE === '--help') {
            greenLog(
                `
            Usage: node tools/scripts/tools.mjs --create --html [type]
            [type]: the type of html app to create
            Options:
            --demo: prepend 'demo' and append '-html' to the app name
            `,
                true
            );
        }

        redLog('Not implemented yet');
        exit();
    }

    if (APP_TYPE == '--node') {
        if (!TYPE || TYPE === '' || TYPE === '--help') {
            greenLog(
                `
            Usage: node tools/scripts/tools.mjs --create --node [type]
            [type]: the type of node app to create
            Options:
            --demo: prepend 'demo' and append '-node' to the app name
            `,
                true
            );
        }

        redLog('Not implemented yet');
        exit();
    }
}

if (OPTION === '--path') {
    const PROJECT_PATH = args[1];
    const COMMANDS = args.slice(2);

    if (!PROJECT_PATH || PROJECT_PATH === '' || PROJECT_PATH === '--help') {
        greenLog(
            `
        Usage: node tools/scripts/tools.mjs --path [project-path] [commands]
            [project-path]: the path of the project
            [commands]: the commands to run
    `,
            true
        );
        exit();
    }

    spawnCommand(COMMANDS[0], COMMANDS.slice(1), { cwd: PROJECT_PATH });
}

if (OPTION === '--test') {
    const TEST_TYPE = args[1];

    if (!TEST_TYPE || TEST_TYPE === '' || TEST_TYPE === '--help') {
        greenLog(
            `
        Usage: node tools/scripts/tools.mjs --test [test-type]
            [test-type]: the type of test to run
                --unit: run unit tests
                --e2e: run e2e tests
    `,
            true
        );
        exit();
    }

    if (TEST_TYPE === '--unit') {
        // spawnCommand('yarn', ['nx', 'run-many', '--target=test']);
        // await childRunCommand('yarn nx run-many --target=test');
        redLog(
            `
            To take advantage of nx colorful console messages, please run the following command to run unit tests:

            yarn nx run-many --target=test
        `,
            true
        );
    }

    if (TEST_TYPE === '--e2e') {
        const ENV = args[2];

        if (!ENV || ENV === '' || ENV === '--help') {
            greenLog(
                `
            Usage: node tools/scripts/tools.mjs --test --e2e [env]
                [env]: the environment to run the tests in
                    react: run tests on react app on port 4003
                    html: run tests on html app on port 4002
        `,
                true
            );
            exit();
        }

        if (ENV === 'react') {
            await childRunCommand(
                'cp tsconfig.base.json tsconfig.json && CYPRESS_REMOTE_DEBUGGING_PORT=9222 PORT=4003 yarn cypress open'
            );
        }

        if (ENV === 'html') {
            await childRunCommand(
                'cp tsconfig.base.json tsconfig.json && CYPRESS_REMOTE_DEBUGGING_PORT=9222 PORT=4002 yarn cypress open'
            );
        }
    }
}

if (OPTION === '--find') {
    const FIND_TYPE = args[1];

    if (!FIND_TYPE || FIND_TYPE === '' || FIND_TYPE === '--help') {
        greenLog(
            `
        Usage: node tools/scripts/tools.mjs --find [option]
            [option]: 
                --imports: find all imports from a directory
    `,
            true
        );
        exit();
    }

    if (FIND_TYPE === '--imports') {
        const TARGET_DIR = args[2];
        const FILTER = args[3];

        if (!TARGET_DIR || TARGET_DIR === '' || TARGET_DIR === '--help') {
            greenLog(
                `
            Usage: node tools/scripts/tools.mjs --find --imports [target-dir]
                [target-dir]: the directory to find imports from
        `,
                true
            );
            exit();
        }

        let res = await findImportsFromDir(TARGET_DIR);

        greenLog(
            `
            Usage: node tools/scripts/tools.mjs --find --imports [target-dir] --filter [keyword]
                [keyword]: the keyword to filter the results by
        `,
            true
        );

        if (FILTER === '--filter') {
            const keyword = args[4];

            res = res.filter((item) => item.includes(keyword));
        }

        console.log(res);
        exit();
    }
}

if (OPTION === '--build') {
    const BUILD_TYPE = args[1];

    if (!BUILD_TYPE || BUILD_TYPE === '' || BUILD_TYPE === '--help') {
        greenLog(
            `
        Usage: node tools/scripts/tools.mjs --build [option]
            [option]: the option to run
                --packages: build packages
                --apps: build apps
                --all: build all
    `,
            true
        );

        exit();
    }

    if (BUILD_TYPE === '--packages') {

        const MODE = args[2];
        console.log("MODE:", MODE);

        if (!MODE || MODE === '' || MODE === '--help') {

            greenLog(
                `
            Usage: node tools/scripts/tools.mjs --build --packages [option]

                [option]: the option to run
                    --async: build packages in sequential
            `,
                true
            );
        }

        if (MODE === '--async') {

            await new Promise((resolve) => setTimeout(resolve, 1000));

            const packages = (await listDirsRecursive('./packages', false));
            let pkgNames = packages.map((item) => item.replace('packages/', ''));

            const orderJson = {};

            (await readJsonFile('./lit-build.config.json')).build.order.forEach((item, i) => {
                orderJson[item] = i;
            })

            pkgNames = customSort(pkgNames, orderJson);

            console.log(pkgNames);

            for (let i = 0; i < pkgNames.length; i++) {

                let name = pkgNames[i];

                if (i < (pkgNames.length - 1)) {
                    name = name + ' --skip';
                }

                await childRunCommand(`yarn build:target ${name}`);
            }

            exit();
        } else {
            const ignoreList = (await listDirsRecursive('./apps', false))
                .map((item) => item.replace('apps/', ''))
                .join(',');

            const command = `yarn nx run-many --target=build --exclude=${ignoreList}`;

            spawnListener(command, {
                onDone: () => {
                    console.log('Done!');
                    exit();
                },
            });

        }



        if (BUILD_TYPE === '--apps') {
            redLog('not implemented yet');
            // spawnListener('yarn build:apps', {
            //     onDone: () => {
            //         console.log("Done!");
            //     }
            // });
        }

        if (BUILD_TYPE === '--all') {
            redLog('not implemented yet');
            // spawnListener('yarn build:all', {
            //     onDone: () => {
            //         console.log("Done!");
            //     }
            // });
        }
    }
}

if (OPTION === '--publish') {
    let OPTION2 = args[1];

    if (!OPTION2 || OPTION2 === '' || OPTION2 === '--help') {
        greenLog(
            `
        Usage: node tools/scripts/tools.mjs --publish [option]
            [option]: the option to run
                --build: build packages before publishing
                --no-build: publish without building
    `,
            true
        );

        exit();
    }

    if (OPTION2 === '--build') {
        spawnListener('yarn build:packages', {
            onDone: () => {
                spawnListener('yarn npx lerna publish --force-publish', {
                    onDone: () => {
                        console.log('Done!');
                    },
                });
            },
        });
    }

    if (OPTION2 === '--no-build') {
        spawnListener('yarn npx lerna publish --force-publish', {
            onDone: () => {
                console.log('Done!');
            },
        });
    }
}

if (OPTION === '--yalc') {
    const OPTION2 = args[1];

    if (!OPTION2 || OPTION2 === '' || OPTION2 === '--help') {
        greenLog(
            `
        Usage: node tools/scripts/tools.mjs --yalc [option]
            [option]: the option to run
                --publish: publish packages to yalc
                --push: push packages to yalc
                --remove: remove packages from yalc
    `,
            true
        );

        exit();
    }

    const dirs = (await listDirsRecursive('./dist/packages', false)).map((item) =>
        item.replace('dist/packages/', '')
    );

    if (OPTION2 === '--publish') {
        dirs.forEach((name) => {
            spawnCommand(
                'yalc',
                ['publish', '--push'],
                {
                    cwd: `dist/packages/${name}`,
                },
                { logExit: false }
            );
        });
    }

    if (OPTION2 === '--push') {
        dirs.forEach((name) => {
            spawnCommand(
                'yalc',
                ['push'],
                {
                    cwd: `dist/packages/${name}`,
                },
                { logExit: false }
            );
        });
    }

    if (OPTION2 === '--remove') {
        dirs.forEach((name) => {
            spawnCommand(
                'yalc',
                ['remove', name],
                {
                    cwd: `dist/packages/${name}`,
                },
                { logExit: false }
            );
        });
    }
    exit();
}