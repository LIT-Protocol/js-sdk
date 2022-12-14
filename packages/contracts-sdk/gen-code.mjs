import { exit } from "process";
import { replaceAutogen, asyncForEach, getFiles, greenLog, readFile, writeFile, yellowLog } from "../../tools/scripts/utils.mjs";

/** ====== Helper ====== */


const contractSdkFileContent = await readFile('./packages/contracts-sdk/src/lib/contracts-sdk.ts');

const specialCases = (fileName) => {
    return fileName
        .replace('.ts', '')
        .replace('LIT', 'lit')
        .replace('PKP', 'pkp')
        .replace('NFT', 'nft')
        .replace('pkpnft', 'pkpNft')
        .replace('RateLimitnft', 'rateLimitNft')
        .replace('pkppermissions', 'pkpPermissions')
}

const abis = (await getFiles('./packages/contracts-sdk/src/abis')).filter((file) => file.includes('.ts') && !file.includes('data.ts')).map((fileName) => {
    return {
        fileName,
        varName: specialCases(fileName),
        varNameCamel: specialCases(fileName).charAt(0).toLowerCase() + specialCases(fileName).slice(1),
        varNameContract: specialCases(fileName) + 'Contract',
        varNameContractCamel: specialCases(fileName).charAt(0).toLowerCase() + specialCases(fileName).slice(1) + 'Contract',
    }
})

console.log(abis);

// exit();

const generatedStrs = {

    // eg.
    // import { accessControlConditions } from '../abis/AccessControlConditions.data';
    // --------------------------------------
    importData: abis.map(({ fileName, varNameCamel }) => {

        // remove .ts
        const importPath = fileName.replace('.ts', '');

        const importStr = `import { ${varNameCamel} } from '../abis/${importPath}.data';`;

        return importStr;
    }).join('\n'),

    // eg.
    // import * as accessControlConditionsContract from '../abis/AccessControlConditions';
    // --------------------------------------
    importContracts: abis.map(({ fileName, varNameContractCamel }) => {

        const importPath = `'../abis/${fileName.replace('.ts', '')}'`;

        const importStr = `import * as ${varNameContractCamel} from ${importPath};`;

        return importStr;
    }).join('\n'),

    // eg.
    // accessControlConditionsContract: accessControlConditionsContract.ContractContext;
    // accessControlConditionsContractSigner: accessControlConditionsContract.ContractContext;
    // --------------------------------------
    declares: abis.map(({ varNameContractCamel }) => {

        const importStr = `  ${varNameContractCamel}: {
    read: ${varNameContractCamel}.ContractContext,
    write: ${varNameContractCamel}.ContractContext,
  }
            `;

        return importStr;
    }).join('\n'),

    // eg.
    // this.accessControlConditionsContract = {} as any
    // --------------------------------------
    blankInit: abis.map(({ varNameContractCamel }) => {

        const importStr = `    this.${varNameContractCamel} = {} as any`;

        return importStr;
    }).join('\n'),

    // eg.
    // this.accessControlConditionsContract = new ethers.Contract(
    //     accessControlConditions.address,
    //     accessControlConditions.abi as any,
    //     this.provider
    //   ) as unknown as accessControlConditionsContract.ContractContext;
    //   this.accessControlConditionsContract = this.accessControlConditionsContract.connect(this.provider);
    // --------------------------------------
    init: abis.map(({ varNameCamel, varNameContractCamel }) => {

        const importStr = `
    this.${varNameContractCamel} = {
        read: (new ethers.Contract(
            ${varNameCamel}.address,
            ${varNameCamel}.abi as any,
            this.provider
        ) as unknown as ${varNameContractCamel}.ContractContext).connect(this.provider),
        write: (new ethers.Contract(
            ${varNameCamel}.address,
            ${varNameCamel}.abi as any,
            this.provider
        ) as unknown as ${varNameContractCamel}.ContractContext).connect(this.provider)
    };`;
        return importStr;
    }).join('\n\n'),
};

let newContent = replaceAutogen({
    startsWith: "// ----- autogen:import-data:start  -----",
    endsWith: "// ----- autogen:import-data:end  -----",
    oldContent: contractSdkFileContent,
    newContent: generatedStrs.importData,
});

newContent = replaceAutogen({
    startsWith: "// ----- autogen:imports:start  -----",
    endsWith: "// ----- autogen:imports:end  -----",
    oldContent: newContent,
    newContent: generatedStrs.importContracts,
});

newContent = replaceAutogen({
    startsWith: "// ----- autogen:declares:start  -----",
    endsWith: "// ----- autogen:declares:end  -----",
    oldContent: newContent,
    newContent: generatedStrs.declares,
});

newContent = replaceAutogen({
    startsWith: "// ----- autogen:blank-init:start  -----",
    endsWith: "// ----- autogen:blank-init:end  -----",
    oldContent: newContent,
    newContent: generatedStrs.blankInit,
});

newContent = replaceAutogen({
    startsWith: "// ----- autogen:init:start  -----",
    endsWith: "// ----- autogen:init:end  -----",
    oldContent: newContent,
    newContent: generatedStrs.init,
});

writeFile('./packages/contracts-sdk/src/lib/contracts-sdk.ts', newContent);
greenLog(`
Code generation complete for ./packages/contracts-sdk/src/lib/contracts-sdk.ts
------------------------------------------------------------------------------
- 1. Filled between => autogen:import-data:start and autogen:import-data:end
- 2. Filled between => autogen:imports:start and autogen:imports:end
- 3. Filled between => autogen:declares:start and autogen:declares:end
- 4. Filled between => autogen:blank-init:start and autogen:blank-init:end
- 5. Filled between => autogen:init:start and autogen:init:end
`, true);


const contextFiles = (await getFiles('./packages/contracts-sdk/src/abis')).filter((file) => file.includes('.ts') && !file.includes('.data.ts'));

yellowLog(`
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
`, true);
await asyncForEach(contextFiles, async (fileName, i) => {
    // path
    const filePath = `./packages/contracts-sdk/src/abis/${fileName}`;

    // read file
    const fileContent = await readFile(filePath);

    const newContent = fileContent.replace(
        `import { Arrayish, BigNumber, BigNumberish, Interface } from 'ethers/utils';`,
        `import { BigNumber, BigNumberish } from 'ethers';
        
        export interface Arrayish {
            toHexString(): string;
            slice(start?: number, end?: number): Arrayish;
            length: number;
            [index: number]: number;
        }
        `)

    // write file
    await writeFile(filePath, newContent);

    greenLog(`Fixed => ${filePath}`);
});

exit();