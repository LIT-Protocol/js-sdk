import { exit } from 'process';
import {
  replaceAutogen,
  asyncForEach,
  getFiles,
  greenLog,
  readFile,
  writeFile,
  yellowLog,
  replaceContent,
} from '../../tools/scripts/utils.mjs';

/** ====== Helper ====== */

const contractSdkFileContent = await readFile(
  './packages/contracts-sdk/src/lib/contracts-sdk.ts'
);

const specialCases = (fileName) => {
  return fileName
    .replace('.ts', '')
    .replace('LIT', 'lit')
    .replace('PKP', 'pkp')
    .replace('NFT', 'nft')
    .replace('pkpnft', 'pkpNft')
    .replace('RateLimitnft', 'rateLimitNft')
    .replace('pkppermissions', 'pkpPermissions');
};

let contracts = await getFiles('./packages/contracts-sdk/src/abis');

contracts = contracts.filter((file) => file.includes('.sol'));

const abis = contracts.map((contractSol) => {
  const contractName = contractSol.replace('.sol', '');

  // const contractData = `./packages/contracts-sdk/src/abis/${contractSol}/${contractName}Data.mjs`;

  return {
    fileName: contractName,
    varName: specialCases(contractName),
    varNameCamel:
      specialCases(contractName).charAt(0).toLowerCase() +
      specialCases(contractName).slice(1),
    varNameContract: specialCases(contractName) + 'Contract',
    varNameContractCamel:
      specialCases(contractName).charAt(0).toLowerCase() +
      specialCases(contractName).slice(1) +
      'Contract',
  };
});

// exit();

const generatedStrs = {
  // eg.
  // import { accessControlConditions } from '../abis/AccessControlConditions.data';
  // --------------------------------------
  importData: abis
    .map(({ fileName, varNameCamel }) => {
      // remove .ts
      const importPath = fileName.replace('.ts', '');

      const importStr = `import { ${importPath}Data } from '../abis/${importPath}.sol/${importPath}Data';`;

      return importStr;
    })
    .join('\n'),

  // eg.
  // import * as accessControlConditionsContract from '../abis/AccessControlConditions';
  // --------------------------------------
  importContracts: abis
    .map(({ fileName, varNameContractCamel }) => {
      const importPath = fileName.replace('.ts', '');

      const importStr = `import * as ${varNameContractCamel} from '../abis/${importPath}.sol/${importPath}';`;

      return importStr;
    })
    .join('\n'),

  // eg.
  // accessControlConditionsContract: accessControlConditionsContract.ContractContext;
  // accessControlConditionsContractSigner: accessControlConditionsContract.ContractContext;
  // --------------------------------------
  declares: abis
    .map(({ varNameContractCamel, fileName }) => {
      const importStr = `  ${varNameContractCamel}: {
    read: ${varNameContractCamel}.${fileName},
    write: ${varNameContractCamel}.${fileName},
  }
            `;

      return importStr;
    })
    .join('\n'),

  // eg.
  // this.accessControlConditionsContract = {} as any
  // --------------------------------------
  blankInit: abis
    .map(({ varNameContractCamel }) => {
      const importStr = `    this.${varNameContractCamel} = {} as any`;

      return importStr;
    })
    .join('\n'),

  // eg.
  // this.accessControlConditionsContract = new ethers.Contract(
  //     accessControlConditions.address,
  //     accessControlConditions.abi as any,
  //     this.provider
  //   ) as unknown as accessControlConditionsContract.ContractContext;
  //   this.accessControlConditionsContract = this.accessControlConditionsContract.connect(this.provider);
  // --------------------------------------
  init: abis
    .map(({ fileName, varNameCamel, varNameContractCamel }) => {
      const importStr = `
    this.${varNameContractCamel} = {
        read: (new ethers.Contract(
            ${fileName}Data.address,
            ${fileName}Data.abi as any,
            this.provider
        ) as unknown as ${varNameContractCamel}.${fileName} & ${varNameContractCamel}.${fileName.replace(
        '.ts',
        ''
      )}),
        write: (new ethers.Contract(
            ${fileName}Data.address,
            ${fileName}Data.abi as any,
            this.signer
        ) as unknown as ${varNameContractCamel}.${fileName} & ${varNameContractCamel}.${fileName.replace(
        '.ts',
        ''
      )})
    };`;
      return importStr;
    })
    .join('\n\n'),
};

const timestamp = new Date().toISOString();

let newContent = replaceContent({
  startsWith: '// ----- autogen:import-data:start  -----',
  endsWith: '// ----- autogen:import-data:end  -----',
  newContent: `// Generated at ${timestamp}\n${generatedStrs.importData}`,
})(contractSdkFileContent);

newContent = replaceContent({
  startsWith: '// ----- autogen:imports:start  -----',
  endsWith: '// ----- autogen:imports:end  -----',
  newContent: `// Generated at ${timestamp}\n${generatedStrs.importContracts}`,
})(newContent);

newContent = replaceContent({
  startsWith: '// ----- autogen:declares:start  -----',
  endsWith: '// ----- autogen:declares:end  -----',
  newContent: `// Generated at ${timestamp}\n${generatedStrs.declares}`,
})(newContent);

newContent = replaceContent({
  startsWith: '// ----- autogen:blank-init:start  -----',
  endsWith: '// ----- autogen:blank-init:end  -----',
  newContent: `// Generated at ${timestamp}\n${generatedStrs.blankInit}`,
})(newContent);

newContent = replaceContent({
  startsWith: '// ----- autogen:init:start  -----',
  endsWith: '// ----- autogen:init:end  -----',
  newContent: `// Generated at ${timestamp}\n${generatedStrs.init}`,
})(newContent);

writeFile('./packages/contracts-sdk/src/lib/contracts-sdk.ts', newContent);
greenLog(
  `
Code generation complete for ./packages/contracts-sdk/src/lib/contracts-sdk.ts
------------------------------------------------------------------------------
- 1. Filled between => autogen:import-data:start and autogen:import-data:end
- 2. Filled between => autogen:imports:start and autogen:imports:end
- 3. Filled between => autogen:declares:start and autogen:declares:end
- 4. Filled between => autogen:blank-init:start and autogen:blank-init:end
- 5. Filled between => autogen:init:start and autogen:init:end
`,
  true
);

const contextFiles = (
  await getFiles('./packages/contracts-sdk/src/abis')
).filter((file) => file.includes('.ts') && !file.includes('.data.ts'));

yellowLog(
  `
Fixing imports on the following files because it's using legacy version 4 of ethers.js
--------------------------------------------------------------------------------------
1. Replacing "import { Arrayish, BigNumber, BigNumberish, Interface } from 'ethers/utils'"
With "import { BigNumber, BigNumberish } from 'ethers"

2. Adding Arrayish interface (https://docs.ethers.io/v4/api-utils.html#arrayish)
export interface Arrayish {
    toHexString(): string;
    slice(start?: number, end?: number): Arrayish;
    length: number;
    [index: number]: number;
}
`,
  true
);
await asyncForEach(contextFiles, async (fileName, i) => {
  // pure file name
  const fileNamePure = fileName.replace('.ts', '');

  // path
  const filePath = `./packages/contracts-sdk/src/abis/${fileName}`;

  // read file
  const fileContent = await readFile(filePath);

  let newContent;

  newContent = fileContent.replace(
    `import { Arrayish, BigNumber, BigNumberish, Interface } from 'ethers/utils';`,
    `
// --- Replaced Content ---
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { BigNumber, BigNumberish } from 'ethers';

export interface Arrayish {
    toHexString(): string;
    slice(start?: number, end?: number): Arrayish;
    length: number;
    [index: number]: number;
}

export type ContractContext = ContractContextLegacy & {
    populateTransaction: ContractContextLegacy
}
// --- Replaced Content ---`
  );

  newContent = newContent
    .replace(
      'export type ContractContext = EthersContractContext<',
      'export type ContractContextLegacy = EthersContractContext<'
    )
    .replaceAll(
      'Promise<ContractTransaction>',
      'Promise<ContractTransaction & TransactionRequest>'
    );

  // write file
  await writeFile(filePath, newContent);

  greenLog(`Fixed => ${filePath}`);
});

exit();
