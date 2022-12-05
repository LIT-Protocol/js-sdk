import { exit } from "process";
import { getFiles, greenLog, readFile, writeFile } from "../../tools/scripts/utils.mjs";

/** ====== Helper ====== */

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


const contractSdkFileContent = await readFile('./packages/contracts-sdk/src/lib/contracts-sdk.ts');

const specialCases = (fileName) => {
    return fileName
        .replace('.ts', '')
        .replace('LIT', 'lit')
        .replace('PKP', 'pkp')
        .replace('NFT', 'nft')
        .replace('pkpnft', 'pkpNft')
        .replace('RateLimitnft', 'rateLimitNft')
}

const generatedStrs = {
    importData: (
        await getFiles('./packages/contracts-sdk/src/abis'))
        .filter((file) => file.includes('.ts') && !file.includes('data.ts')
        ).map((fileName) => {

            // append Contract at the end
            const varName = specialCases(fileName);

            // make first letter lowercase
            const varNameLower = varName.charAt(0).toLowerCase() + varName.slice(1);

            // remove .ts
            const importPath = fileName.replace('.ts', '');

            const importStr = `import { ${varNameLower} } from '../abis/${importPath}.data';`;

            return importStr;
        }).join('\n'),
    importContracts: (
        await getFiles('./packages/contracts-sdk/src/abis'))
        .filter((file) => file.includes('.ts') && !file.includes('data.ts')
        ).map((fileName) => {

            // append Contract at the end
            const importName = specialCases(fileName)
                .replace(fileName.charAt(0), fileName.charAt(0).toLowerCase())
                + 'Contract';

            const importPath = `'../abis/${fileName.replace('.ts', '')}'`;

            const importStr = `import * as ${importName} from ${importPath};`;

            return importStr;
        }).join('\n'),
    declares: (
        await getFiles('./packages/contracts-sdk/src/abis'))
        .filter((file) => file.includes('.ts') && !file.includes('data.ts')
        ).map((fileName) => {

            // append Contract at the end
            const importName = specialCases(fileName)
                .replace(fileName.charAt(0), fileName.charAt(0).toLowerCase())
                + 'Contract';

            const importStr = `  ${importName}: ${importName}.ContractContext;`;

            return importStr;
        }).join('\n'),
    init: (
        await getFiles('./packages/contracts-sdk/src/abis'))
        .filter((file) => file.includes('.ts') && !file.includes('data.ts')
        ).map((fileName) => {

            // append Contract at the end
            const importName = specialCases(fileName)
                .replace(fileName.charAt(0), fileName.charAt(0).toLowerCase())
                + 'Contract';

            const varName = specialCases(fileName);

            // make first letter lowercase
            const varNameLower = varName.charAt(0).toLowerCase() + varName.slice(1);

            const importStr = `    this.${importName} = new ethers.Contract(
      ${varNameLower}.address,
      ${varNameLower}.abi as any,
      this.provider
    ) as unknown as ${importName}.ContractContext;`;

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
    startsWith: "// ----- autogen:init:start  -----",
    endsWith: "// ----- autogen:init:end  -----",
    oldContent: newContent,
    newContent: generatedStrs.init,
});

writeFile('./packages/contracts-sdk/src/lib/contracts-sdk.ts', newContent);
greenLog('Done generating code in ./packages/contracts-sdk/src/lib/contracts-sdk.ts');
exit();