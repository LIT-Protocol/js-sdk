/**
 * Custom Network Context to Signatures Converter
 *
 * This script converts a custom networkContext.json file to exportable contract signatures.
 *
 * Usage as CLI:
 * ```
 * bun run ./src/custom-network-signatures.ts ./customNetworkContext.json naga-develop
 * ```
 *
 * Usage as module:
 * ```typescript
 * import { generateSignaturesFromContext } from '@lit-protocol/contracts/custom-network-signatures';
 * await generateSignaturesFromContext({
 *   jsonFilePath: './customNetworkContext.json',
 *   networkName: 'my-network',
 *   outputDir: './', // Will output in the same directory as the script
 *   useScriptDirectory: true, // Set to true to use calling script's directory as base
 *   callerPath: import.meta.url // Required when useScriptDirectory is true
 * });
 * ```
 */

import * as fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { METHODS_TO_EXTRACT } from './config/methods';
import type { NetworkCache } from './types/contracts';
import { extractAbiMethods } from './utils/abi-extractor';

interface ContractInfo {
  address: string;
  abi: any[];
  name: string;
}

export interface GenerateSignaturesOptions {
  jsonFilePath: string;
  networkName?: string;
  outputDir?: string;
  useScriptDirectory?: boolean; // If true, paths are relative to script location
  callerPath?: string; // The import.meta.url of the calling script
}

export interface BuildSignaturesFromContextOptions
  extends Omit<GenerateSignaturesOptions, 'outputDir'> {}

export interface BuildSignaturesFromContextResult {
  signatures: GeneratedSignatures;
  networkName: string;
  resolvedJsonPath: string;
  baseDirectory: string;
}

/**
 * Resolves the on-disk path of this module in both ESM and CJS bundles.
 * Falls back to __filename when bundlers strip import.meta.url.
 */
function getModulePathFromImportMeta(): string | undefined {
  const moduleUrl = (import.meta as unknown as { url?: string } | undefined)
    ?.url;
  if (typeof moduleUrl === 'string') {
    try {
      return fileURLToPath(moduleUrl);
    } catch (error) {
      console.warn(
        'Failed to resolve fileURLToPath from import.meta.url:',
        error
      );
    }
  }

  return undefined;
}

/**
 * Resolves the on-disk path of this module in both ESM and CJS bundles.
 * Falls back to __filename when bundlers strip import.meta.url.
 */
function getCurrentModulePath(): string | undefined {
  const modulePath = getModulePathFromImportMeta();
  if (modulePath) {
    return modulePath;
  }

  if (typeof __filename !== 'undefined') {
    return __filename;
  }

  return undefined;
}

/**
 * Gets the base directory for resolving paths
 * @param useScriptDirectory - Whether to use script's directory or current working directory
 * @param callerPath - The import.meta.url of the calling script
 * @returns The base directory path
 */
function getBaseDirectory(
  useScriptDirectory: boolean = false,
  callerPath?: string
): string {
  if (useScriptDirectory) {
    // When called from another module with callerPath
    if (callerPath) {
      const callerDir = dirname(fileURLToPath(callerPath));
      console.log('Using caller directory:', callerDir);
      return callerDir;
    }
    // When running directly with node/bun
    if (typeof __filename !== 'undefined') {
      console.log('Using __dirname:', __dirname);
      return __dirname;
    }
    // When running as module without callerPath
    const modulePath = getCurrentModulePath();
    if (modulePath) {
      const moduleDir = dirname(modulePath);
      console.log('Using module directory:', moduleDir);
      return moduleDir;
    }
    console.log('Using current working directory:', process.cwd());
    return process.cwd();
  }
  // Use current working directory
  const cwd = process.cwd();
  console.log('Using current working directory:', cwd);
  return cwd;
}

/**
 * Resolves a path relative to the base directory
 * @param relativePath - The path to resolve (can be absolute or relative)
 * @param baseDir - The base directory to resolve from (only used for relative paths)
 * @param forceRelative - If true, always resolve relative to baseDir even if path is absolute
 * @returns The resolved absolute path
 */
function resolvePath(
  relativePath: string,
  baseDir: string,
  forceRelative: boolean = false
): string {
  if (path.isAbsolute(relativePath) && !forceRelative) {
    return relativePath;
  }
  return path.resolve(baseDir, relativePath);
}

/**
 * Converts raw contract mapping to NetworkCache format
 * @param rawJson - The raw JSON data from the file
 * @param networkName - Name of the network
 * @returns NetworkCache formatted object
 */
function convertToNetworkCache(
  rawJson: Record<string, ContractInfo>,
  networkName: string
): NetworkCache {
  // Convert the contract mapping to NetworkCache format
  const contractGroups = Object.entries(rawJson).map(
    ([contractName, info]) => ({
      name: contractName,
      contracts: [
        {
          network: networkName,
          address_hash: info.address,
          inserted_at: new Date().toISOString(),
          ABI: info.abi,
        },
      ],
    })
  );

  return {
    data: contractGroups,
  };
}

/**
 * Generates ABI signatures in the standard format for Lit Protocol
 * @param networkData - The network cache object
 * @returns Signatures object with contract-organized structure
 */
function generateAbiSignatures(networkData: NetworkCache) {
  const methodsByContract = new Map<string, string[]>();

  // Group methods by contract
  METHODS_TO_EXTRACT.forEach((methodString) => {
    const [contractName, methodName] = methodString.split('.');
    if (!methodsByContract.has(contractName)) {
      methodsByContract.set(contractName, []);
    }
    methodsByContract.get(contractName)!.push(methodName);
  });

  // Extract methods for each contract
  const signatures: Record<
    string,
    {
      address: string;
      methods: Record<string, any>;
      events: any[];
    }
  > = {};

  networkData.data.forEach((contractGroup) => {
    const contractName = contractGroup.name;
    if (methodsByContract.has(contractName)) {
      const methods = methodsByContract.get(contractName)!;
      const contractMethods = extractAbiMethods(networkData, methods);

      if (Object.keys(contractMethods).length > 0) {
        const address = contractGroup.contracts[0].address_hash;
        const events = contractGroup.contracts[0].ABI.filter(
          (item) => item.type === 'event'
        );

        signatures[contractName] = {
          address,
          methods: Object.fromEntries(
            Object.entries(contractMethods).map(([methodName, data]) => [
              methodName,
              data.abi,
            ])
          ),
          events,
        };
      }
    }
  });

  return signatures;
}

export type GeneratedSignatures = ReturnType<typeof generateAbiSignatures>;

export function buildSignaturesFromContext(
  options: BuildSignaturesFromContextOptions
): BuildSignaturesFromContextResult {
  const {
    jsonFilePath,
    networkName = 'custom-network',
    useScriptDirectory = false,
    callerPath,
  } = options;

  if (useScriptDirectory && !callerPath) {
    throw new Error(
      'callerPath (import.meta.url) is required when useScriptDirectory is true'
    );
  }

  const baseDirectory = getBaseDirectory(useScriptDirectory, callerPath);
  const resolvedJsonPath = resolvePath(jsonFilePath, baseDirectory);

  console.log(`📝 Processing custom network context: ${resolvedJsonPath}`);

  const rawJsonData = JSON.parse(fs.readFileSync(resolvedJsonPath, 'utf8'));
  const jsonData = convertToNetworkCache(rawJsonData, networkName);

  console.log('📊 Generating signatures...');
  const signatures = generateAbiSignatures(jsonData);

  return {
    signatures,
    networkName,
    resolvedJsonPath,
    baseDirectory,
  };
}

/**
 * Generates signature files from a network context JSON file
 * @param options - Configuration options
 * @returns Promise that resolves when files are written
 */
export async function generateSignaturesFromContext(
  options: GenerateSignaturesOptions
): Promise<void> {
  try {
    const { signatures, networkName, resolvedJsonPath, baseDirectory } =
      buildSignaturesFromContext(options);

    const outputDir = options.outputDir ?? './dist/signatures';
    const resolvedOutputDir = resolvePath(outputDir, baseDirectory, true);

    // Ensure output directory exists
    if (!fs.existsSync(resolvedOutputDir)) {
      fs.mkdirSync(resolvedOutputDir, { recursive: true });
    }

    console.log(`📁 Output directory: ${resolvedOutputDir}`);

    // Write signatures to file
    const outputPath = path.join(resolvedOutputDir, `${networkName}.js`);
    const outputPathCjs = path.join(resolvedOutputDir, `${networkName}.cjs`);
    const outputPathTs = path.join(resolvedOutputDir, `${networkName}.ts`);

    // Write TS version with the standard format
    fs.writeFileSync(
      outputPathTs,
      `/**
 * Generated Contract Method Signatures for ${networkName}
 * This file is auto-generated. DO NOT EDIT UNLESS YOU KNOW WHAT YOU'RE DOING.
 */

export const signatures = ${JSON.stringify(signatures, null, 2)} as const;
export type Signatures = typeof signatures;
`
    );

    // Write ESM version
    fs.writeFileSync(
      outputPath,
      `/**
 * Generated Contract Method Signatures for ${networkName}
 * This file is auto-generated. DO NOT EDIT UNLESS YOU KNOW WHAT YOU'RE DOING.
 */

export const signatures = ${JSON.stringify(signatures, null, 2)};
`
    );

    // Write CJS version
    fs.writeFileSync(
      outputPathCjs,
      `/**
 * Generated Contract Method Signatures for ${networkName}
 * This file is auto-generated. DO NOT EDIT UNLESS YOU KNOW WHAT YOU'RE DOING.
 */

const signatures = ${JSON.stringify(signatures, null, 2)};

module.exports = {
  signatures
};
`
    );

    console.log(`✅ Signatures successfully generated and written to:`);
    console.log(`   - ${outputPath}`);
    console.log(`   - ${outputPathCjs}`);
    console.log(`   - ${outputPathTs}`);
  } catch (error) {
    console.error('❌ Error processing network context:', error);
    throw error;
  }
}

// Determine if the script is being run directly
// process.argv[0] is the bun executable
// process.argv[1] is the script being run
const mainScriptPath = path.resolve(process.argv[1] || '');
const modulePathFromMeta = getModulePathFromImportMeta();
const resolvedModulePath = modulePathFromMeta
  ? path.resolve(modulePathFromMeta)
  : undefined;

if (resolvedModulePath && mainScriptPath === resolvedModulePath) {
  // This means custom-network-signatures.ts was the script passed to `bun run`
  const jsonFilePath = process.argv[2];
  const networkName = process.argv[3];

  if (!jsonFilePath) {
    console.error('❌ Please provide a path to the networkContext.json file');
    console.log(
      'Usage: bun run ./src/custom-network-signatures.ts path/to/networkContext.json [custom-network-name]'
    );
    process.exit(1);
  }

  // When running as CLI, we want to use the current working directory
  generateSignaturesFromContext({
    jsonFilePath,
    networkName,
    useScriptDirectory: false, // Use current working directory for CLI usage
  }).catch((error) => {
    console.error(
      'Error in CLI execution of custom-network-signatures:',
      error
    );
    process.exit(1);
  });
}
