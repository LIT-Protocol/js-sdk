import fs from 'fs';
import path from 'path';
import { exit } from 'process';
import fetch from 'node-fetch';
import { exec } from 'child_process';
import { greenLog, redLog } from '../../tools/scripts/utils.mjs';

// ----- Helper
/**
 * runCommand - Runs a command and returns the result as a promise.
 *
 * @param {string} command - The command to run.
 *
 * @returns {Promise} A promise that resolves to the output of the command.
 */
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
 * writeFile - Writes the specified content to a file.
 *
 * @param {string} filename - The name of the file to write to.
 * @param {string} content - The content to write to the file.
 */
export async function writeFile(filename, content) {
  const filePath = path.join(process.cwd(), filename);
  fs.writeFileSync(filePath, content);
}

/**
 * createDirs - Creates the specified directory and any parent directories that do not exist.
 *
 * @param {string} path - The path of the directory to create.
 */
export const createDirs = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
};

/**
 * readJsonFile - Reads a file and parses its content as JSON.
 *
 * @param {string} filename - The name of the file to read.
 *
 * @returns {object} The content of the file as a JSON object.
 */
export async function readJsonFile(filename) {
  const filePath = path.join(process.cwd(), filename);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

/**
 * writeJsonFile - Writes the specified content to a file as JSON.
 *
 * @param {string} filename - The name of the file to write to.
 * @param {object} content - The content to write to the file as JSON.
 */
export async function writeJsonFile(filename, content) {
  const filePath = path.join(process.cwd(), filename);
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
}

/**
 * getArgs - Returns the command line arguments passed to the program.
 *
 * @returns {Array} An array of strings containing the command line arguments.
 */
export const getArgs = () => {
  const args = process.argv.slice(2);
  return args;
};

/**
 * asyncForEach - Asynchronously iterates over an array and applies the specified callback to each element.
 *
 * @param {Array} array - The array to iterate over.
 * @param {function} callback - The function to apply to each element of the array.
 */
export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

/**
 * getContractAddresses - Returns the contract addresses of deployed contracts.
 *
 * @param {object} LitConfig - An object containing the configuration settings for the contracts.
 *
 * @returns {Array} An array of objects containing the names, corrected names, export names,
 * ABI paths, and addresses of the deployed contracts.
 */
export const getContractAddresses = async (LitConfig) => {
  // get deployed contract addresses
  let contractAddresses;
  if (process.env.LIT_JS_SDK_LOCAL_NODE_DEV === 'true') {
    // get contracts from local filesystem
    contractAddresses = await readJsonFile(LitConfig.contractsLocal);
  } else {
    // get contracts from remote
    contractAddresses = JSON.parse(
      await fetch(LitConfig.contracts).then((res) => res.text())
    );
  }
  Object.entries(contractAddresses).forEach(([key, value]) => {
    if (key.includes('ContractAddress')) return;

    delete contractAddresses[key];
  });

  const contracts = [];
  Object.entries(contractAddresses).forEach((item) => {
    // remove 'ContractAddress' from string
    let correctedName = item[0].replace('ContractAddress', '');
    let exportName = correctedName;

    // capitalize first letter
    correctedName =
      correctedName.charAt(0).toUpperCase() + correctedName.slice(1);

    // replace Pkp with PKP
    correctedName = correctedName.replace('Pkp', 'PKP');
    correctedName = correctedName.replace('Nft', 'NFT');
    correctedName = correctedName.replace('Lit', 'LIT');
    correctedName = correctedName.replace('Resolver', 'ContractResolver');
    if (correctedName == 'HdKeyDeriver') {
      // dont process the contract with name as it is internally used wihtin `PubkeyRouter`
      return;
    }
    if (correctedName === 'ContractResolver') {
      exportName = 'contractResolver';
    }

    // append .json
    // correctedName = correctedName
    let abiPath;
    if (process.env.LIT_JS_SDK_LOCAL_NODE_DEV === 'true') {
      abiPath = LitConfig.abis.dirLocal + correctedName + '.json';
    } else {
      abiPath = LitConfig.root + LitConfig.abis.dir + correctedName + '.json';
    }

    contracts.push({
      name: item[0],
      correctedName,
      exportName: exportName,
      abiPath,
      address: item[1],
    });
  });
  return contracts;
};

// ------ Run
const root = './packages/contracts-sdk/';
const src = `${root}src/`;
const abisDir = `${src}abis/`;
const LitConfig = await readJsonFile(`${root}lit-contracts.config.json`);

const deployedContracts = await getContractAddresses(LitConfig);

await writeJsonFile(src + 'deployed-contracts.json', deployedContracts);

await asyncForEach(deployedContracts, async (contract) => {
  let json;

  try {
    if (process.env.LIT_JS_SDK_LOCAL_NODE_DEV === 'true') {
      // get from local filesystem
      json = await readJsonFile(contract.abiPath);
    } else {
      // get from remote
      json = await fetch(contract.abiPath, {
        headers: LitConfig.abis.isPrivate
          ? {
              Authorization: `token ${process.env.LIT_JS_SDK_GITHUB_ACCESS_TOKEN}`,
            }
          : {},
      }).then((res) => res.text());
      json = JSON.parse(json);
    }
  } catch (e) {
    redLog(`Failed to fetch ${contract.abiPath}`);
  }

  let abi = json.abi;

  // -- create dir if not exists
  createDirs(abisDir);

  const abiPath = abisDir + contract.correctedName + '.json';

  // -- write abi to file
  try {
    await writeJsonFile(abiPath, abi);
  } catch (e) {
    redLog(`Failed to write ${abiPath} => ${e.message}`);
  }

  const dataPath = abisDir + contract.correctedName + '.data.ts';

  // -- write data (address, abi) to file
  await writeFile(
    dataPath,
    `export const ${contract.exportName} = ` +
      JSON.stringify(
        {
          address: contract.address,
          abi,
        },
        null,
        2
      )
  );

  await runCommand(`yarn abi-types-generator ${abiPath} --provider=ethers`);

  greenLog(`Wrote => ${abiPath}`);
});

exit();
