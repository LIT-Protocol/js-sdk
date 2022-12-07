import { exit } from "process";
import { childRunCommand, getArgs, greenLog, readFile, readJsonFile, redLog, replaceAutogen, spawnCommand, writeFile } from "./utils.mjs";

const args = getArgs();

const OPTION = args[0];

if (!OPTION || OPTION === '' || OPTION === '--help') {
    greenLog(`
        Usage: node packages/contracts-sdk/tools.mjs [option][...args]
        Options:
            --help: show this help
            --create-react-app: create a new react app
            --project-path: project directory to run commands in
            --test: run tests
    `, true);
    exit();
}

if (OPTION === '--create-react-app') {

    let APP_NAME = args[1];
    const TYPE = args[2];

    if (!APP_NAME || APP_NAME === '' || APP_NAME === '--help') {
        greenLog(`
        Usage: node packages/contracts-sdk/tools.mjs --create-react-app [app-name] [option]
            [app-name]: the name of the react app
        Options:
            --demo: prepend name with "demo-" and append "-react"
    `, true);
        exit();
    }

    if (TYPE === '--demo') {
        APP_NAME = `demo-${APP_NAME}-react`;
    }

    const INSTALL_PATH = `apps/${APP_NAME}`;

    await childRunCommand(`git clone https://github.com/LIT-Protocol/demo-project-react-template ${INSTALL_PATH}`);

    await writeFile(`${INSTALL_PATH}/src/App.js`, replaceAutogen({
        oldContent: await readFile(`${INSTALL_PATH}/src/App.js`),
        startsWith: '// ----- autogen:app-name:start  -----',
        endsWith: '// ----- autogen:app-name:end  -----',
        newContent: `const [appName, setAppName] = useState('${APP_NAME}');`
    }));

    await childRunCommand(`rm -rf ${INSTALL_PATH}/.git`);


    const packageJson = await readJsonFile(`${INSTALL_PATH}/package.json`);
    packageJson.name = APP_NAME;

    // generate a port number between 4100 and 4200
    const port = Math.floor(Math.random() * 100) + 4100;
    packageJson.scripts.start = `PORT=${port} react-scripts start`;

    await writeFile(`${INSTALL_PATH}/package.json`, JSON.stringify(packageJson, null, 2));

    await childRunCommand(`cd ${INSTALL_PATH} && yarn install`);

    greenLog(`Creating a project.json for nx workspace`);

    const projectJson = await readFile(`tools/scripts/project.json.template`);
    const newProjectJson = projectJson
        .replaceAll('PROJECT_NAME', APP_NAME)
        .replaceAll('PROJECT_PATH', `apps/${APP_NAME}`)
        .replaceAll('PROJECT_PORT', port)

    await writeFile(`${INSTALL_PATH}/project.json`, newProjectJson);

    greenLog("Adding project to nx workspace");

    const workspaceJson = await readJsonFile(`workspace.json`);

    workspaceJson.projects[APP_NAME] = INSTALL_PATH;

    await writeFile(`workspace.json`, JSON.stringify(workspaceJson, null, 2));

    greenLog("Done!");

}

if (OPTION === '--project-path') {
    const PROJECT_PATH = args[1];
    const COMMANDS = args.slice(2);

    if (!PROJECT_PATH || PROJECT_PATH === '' || PROJECT_PATH === '--help') {
        greenLog(`
        Usage: node packages/contracts-sdk/tools.mjs --project-path [project-path] [commands]
            [project-path]: the path of the project
            [commands]: the commands to run
    `, true);
        exit();
    }

    spawnCommand(COMMANDS[0], COMMANDS.slice(1), { cwd: PROJECT_PATH });
}

if (OPTION === '--test') {

    const TEST_TYPE = args[1];

    if (!TEST_TYPE || TEST_TYPE === '' || TEST_TYPE === '--help') {

        greenLog(`
        Usage: node packages/contracts-sdk/tools.mjs --test [test-type]
            [test-type]: the type of test to run
                --unit: run unit tests
                --e2e: run e2e tests
    `, true);
        exit();
    }


    if (TEST_TYPE === '--unit') {
        // spawnCommand('yarn', ['nx', 'run-many', '--target=test']);
        // await childRunCommand('yarn nx run-many --target=test');
        redLog(`
            To take advantage of nx colorful console messages, please run the following command to run unit tests:

            yarn nx run-many --target=test
        `, true);
    }

    if (TEST_TYPE === '--e2e'){

        const ENV = args[2];

        if (!ENV || ENV === '' || ENV === '--help') {

            greenLog(`
            Usage: node packages/contracts-sdk/tools.mjs --test --e2e [env]
                [env]: the environment to run the tests in
                    react: run tests on react app on port 4003
                    html: run tests on html app on port 4002
        `, true);
            exit();
        }

        if (ENV === 'react') {
            await childRunCommand('cp tsconfig.base.json tsconfig.json && CYPRESS_REMOTE_DEBUGGING_PORT=9222 PORT=4003 yarn cypress open');
        }

        if (ENV === 'html') {
            await childRunCommand('cp tsconfig.base.json tsconfig.json && CYPRESS_REMOTE_DEBUGGING_PORT=9222 PORT=4002 yarn cypress open');
        }
    }
}