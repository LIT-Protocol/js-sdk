import { exit } from "process";
import { childRunCommand, getArgs, greenLog, readFile, readJsonFile, replaceAutogen, spawnCommand, writeFile } from "./utils.mjs";

const args = getArgs();

const OPTION = args[0];

if (!OPTION || OPTION === '' || OPTION === '--help') {
    greenLog(`
        Usage: node packages/contracts-sdk/tools.mjs [option] [arg]
        Options:
            --help: show this help
            --create-react-app: create a new react app
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

    // await childRunCommand(`rm -rf ${INSTALL_PATH}`);

    await childRunCommand(`git clone https://github.com/LIT-Protocol/demo-project-react-template ${INSTALL_PATH}`);

    await writeFile(`${INSTALL_PATH}/src/App.js`, replaceAutogen({
        oldContent: await readFile(`${INSTALL_PATH}/src/App.js`),
        startsWith: '// ----- autogen:app-name:start  -----',
        endsWith: '// ----- autogen:app-name:end  -----',
        newContent: `const [appName, setAppName] = useState('${APP_NAME}');`
    }));

    const packageJson = await readJsonFile(`${INSTALL_PATH}/package.json`);
    packageJson.name = APP_NAME;

    // generate a port number between 4100 and 4200
    const port = Math.floor(Math.random() * 100) + 4100;
    packageJson.scripts.start = `PORT=${port} react-scripts start`;

    await writeFile(`${INSTALL_PATH}/package.json`, JSON.stringify(packageJson, null, 2));

    await childRunCommand(`cd ${INSTALL_PATH} && yarn install`);

    greenLog(`Creating a project.json for nx workspace`);

    // create a file called project.json if it doesn't exist

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