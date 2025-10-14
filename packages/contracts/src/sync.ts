/**
 * Lit Protocol Contract Fetcher
 * Main entry point for fetching and caching contract ABIs and addresses
 */

import * as fs from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env';
import { METHODS_TO_EXTRACT } from './config/methods';
import { NETWORKS } from './config/networks';
import { ContractService } from './services/contracts';
import { GitHubService } from './services/github';
import type { NetworkCache } from './types/contracts';
import { extractAbiMethods } from './utils/abi-extractor';
import { formatNetworkName } from './utils/format';

const requireModule = createRequire(import.meta.url);

/**
 * Generates ABI signatures for specified methods
 */
function generateAbiSignatures(networkData: NetworkCache) {
  console.log('\n📝 Generating ABI signatures...');
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
        const rawEvents = contractGroup.contracts[0].ABI.filter(
          (item) => item.type === 'event'
        );

        // Handle duplicate event names by adding suffixes
        const nameCount = new Map<string, number>();
        const events = rawEvents.map((event) => {
          const originalName = event.name;
          const count = nameCount.get(originalName) || 0;
          nameCount.set(originalName, count + 1);

          // If this is a duplicate (count > 0), add suffix
          if (count > 0) {
            return {
              ...event,
              name: `${originalName}_Duplicate_${count}`,
            };
          }
          return event;
        });

        signatures[contractName] = {
          address,
          methods: Object.fromEntries(
            Object.entries(contractMethods).map(([methodName, data]) => {
              return [methodName, data.abi];
            })
          ),
          events,
        };
      }
    }
  });

  return signatures;
}

/**
 * Updates the package.json exports field with the correct paths for all formats
 */
function updatePackageJsonExports(networks: {
  prod: readonly string[];
  dev: readonly string[];
}): void {
  console.log('\n📝 Updating package.json exports...');

  const packageJsonPath = './package.json';
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  // Initialize exports object with the root export
  const exports: Record<string, any> = {
    '.': {
      import: './dist/index.js',
      require: './dist/index.cjs',
      types: './dist/index.d.ts',
    },
  };

  const typesVersions: Record<string, Record<string, string[]>> = {
    '*': {},
  };

  // Add production network exports
  networks.prod.forEach((network) => {
    const prodNetworkPath = `prod/${network}`;
    const sigNetworkPath = `signatures/${network}`;

    exports[`./${prodNetworkPath}`] = {
      import: `./dist/${prodNetworkPath}.js`,
      require: `./dist/${prodNetworkPath}.cjs`,
      types: `./dist/${prodNetworkPath}.d.ts`,
    };
    typesVersions['*']![prodNetworkPath] = [`dist/${prodNetworkPath}.d.ts`];

    exports[`./${sigNetworkPath}`] = {
      import: `./dist/${sigNetworkPath}.js`,
      require: `./dist/${sigNetworkPath}.cjs`,
      types: `./dist/${sigNetworkPath}.d.ts`,
    };
    typesVersions['*']![sigNetworkPath] = [`dist/${sigNetworkPath}.d.ts`];
  });

  // Add development network exports
  networks.dev.forEach((network) => {
    const devNetworkPath = `dev/${network}`;
    const sigNetworkPath = `signatures/${network}`;

    exports[`./${devNetworkPath}`] = {
      import: `./dist/${devNetworkPath}.js`,
      require: `./dist/${devNetworkPath}.cjs`,
      types: `./dist/${devNetworkPath}.d.ts`,
    };
    typesVersions['*']![devNetworkPath] = [`dist/${devNetworkPath}.d.ts`];

    exports[`./${sigNetworkPath}`] = {
      import: `./dist/${sigNetworkPath}.js`,
      require: `./dist/${sigNetworkPath}.cjs`,
      types: `./dist/${sigNetworkPath}.d.ts`,
    };
    typesVersions['*']![sigNetworkPath] = [`dist/${sigNetworkPath}.d.ts`];
  });

  // Add custom network signatures
  const customNetworkSignaturesPath = 'custom-network-signatures';
  exports[`./${customNetworkSignaturesPath}`] = {
    import: `./dist/${customNetworkSignaturesPath}.js`,
    require: `./dist/${customNetworkSignaturesPath}.cjs`,
    types: `./dist/${customNetworkSignaturesPath}.d.ts`,
  };
  typesVersions['*']![customNetworkSignaturesPath] = [
    `dist/${customNetworkSignaturesPath}.d.ts`,
  ];

  // Update package.json
  packageJson.exports = exports;
  packageJson.typesVersions = typesVersions;
  packageJson.main = './dist/index.cjs';
  packageJson.module = './dist/index.js';

  // Write updated package.json
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n'
  );
  console.log('✅ Successfully updated package.json exports');
}

/**
 * Generates index files for different module formats (TypeScript, ES Modules, and CommonJS)
 */
function generateIndexFiles(failedNetworks: string[] = []): void {
  console.log('\n📝 Generating index files...');

  const exports: string[] = [];
  const signatureExports: string[] = [];

  // Create signatures directory if it doesn't exist
  if (!fs.existsSync('./dist/signatures')) {
    fs.mkdirSync('./dist/signatures', { recursive: true });
  }

  // Add production exports and generate signatures
  NETWORKS.prod.networks.forEach((network) => {
    const formattedName = formatNetworkName(network);
    const exportLine = `export { ${formattedName} } from "./prod/${network}";`;
    if (failedNetworks.includes(network)) {
      exports.push(`// ${exportLine} // Network failed to generate`);
    } else {
      exports.push(exportLine);
      signatureExports.push(
        `export { signatures as ${formattedName}Signatures } from "./signatures/${network}";`
      );

      try {
        const networkData = requireModule(`../dist/prod/${network}.js`);
        const signatures = generateAbiSignatures(networkData[formattedName]);

        const tsSignatures = `/**
 * Generated Contract Method Signatures for ${network}
 * This file is auto-generated. DO NOT EDIT UNLESS YOU KNOW WHAT YOU'RE DOING.
 */

export const signatures = ${JSON.stringify(signatures, null, 2)} as const;
export type Signatures = typeof signatures;
`;

        const jsSignatures = `/**
 * Generated Contract Method Signatures for ${network}
 * This file is auto-generated. DO NOT EDIT UNLESS YOU KNOW WHAT YOU'RE DOING.
 */

export const signatures = ${JSON.stringify(signatures, null, 2)};
`;

        const cjsSignatures = `/**
 * Generated Contract Method Signatures for ${network}
 * This file is auto-generated. DO NOT EDIT UNLESS YOU KNOW WHAT YOU'RE DOING.
 */

const signatures = ${JSON.stringify(signatures, null, 2)};

module.exports = {
  signatures
};
`;

        const signatureBasePath = `./dist/signatures/${network}`;
        fs.writeFileSync(`${signatureBasePath}.d.ts`, tsSignatures);
        fs.writeFileSync(`${signatureBasePath}.js`, jsSignatures);
        fs.writeFileSync(`${signatureBasePath}.cjs`, cjsSignatures);
      } catch (error) {
        console.warn(`Failed to generate signatures for ${network}:`, error);
      }
    }
  });

  // Add development exports and generate signatures
  NETWORKS.dev.networks.forEach((network) => {
    const formattedName = formatNetworkName(network);
    const exportLine = `export { ${formattedName} } from "./dev/${network}";`;
    if (failedNetworks.includes(network)) {
      exports.push(`// ${exportLine} // Network failed to generate`);
    } else {
      exports.push(exportLine);
      signatureExports.push(
        `export { signatures as ${formattedName}Signatures } from "./signatures/${network}";`
      );

      try {
        const networkData = requireModule(`../dist/dev/${network}.js`);
        const signatures = generateAbiSignatures(networkData[formattedName]);

        const tsSignatures = `/**
 * Generated Contract Method Signatures for ${network}
 * This file is auto-generated. DO NOT EDIT UNLESS YOU KNOW WHAT YOU'RE DOING.
 */

export const signatures = ${JSON.stringify(signatures, null, 2)} as const;
export type Signatures = typeof signatures;
`;

        const jsSignatures = `/**
 * Generated Contract Method Signatures for ${network}
 * This file is auto-generated. DO NOT EDIT UNLESS YOU KNOW WHAT YOU'RE DOING.
 */

export const signatures = ${JSON.stringify(signatures, null, 2)};
`;

        const cjsSignatures = `/**
 * Generated Contract Method Signatures for ${network}
 * This file is auto-generated. DO NOT EDIT UNLESS YOU KNOW WHAT YOU'RE DOING.
 */

const signatures = ${JSON.stringify(signatures, null, 2)};

module.exports = {
  signatures
};
`;

        const signatureBasePath = `./dist/signatures/${network}`;
        fs.writeFileSync(`${signatureBasePath}.d.ts`, tsSignatures);
        fs.writeFileSync(`${signatureBasePath}.js`, jsSignatures);
        fs.writeFileSync(`${signatureBasePath}.cjs`, cjsSignatures);
      } catch (error) {
        console.warn(`Failed to generate signatures for ${network}:`, error);
      }
    }
  });

  const tsContent = `/**
 * Generated Exports
 * This file is auto-generated. DO NOT EDIT UNLESS YOU KNOW WHAT YOU'RE DOING.
 */

${exports.join('\n')}

${signatureExports.join('\n')}
`;

  const jsContent = `/**
 * Generated Exports
 * This file is auto-generated. DO NOT EDIT UNLESS YOU KNOW WHAT YOU'RE DOING.
 */

${exports
  .map((line) => {
    if (line.startsWith('//')) return line;

    const [exportPart, importPart] = line.split(' from ');
    const importPath = importPart
      .replace(';', '')
      .replace(/["']/g, '')
      .replace('.ts', '');
    return `${exportPart} from "${importPath}.js";`;
  })
  .join('\n')}

${signatureExports
  .map((line) => {
    const [exportPart, importPart] = line.split(' from ');
    const importPath = importPart
      .replace(';', '')
      .replace(/["']/g, '')
      .replace('.ts', '');
    return `${exportPart} from "${importPath}.js";`;
  })
  .join('\n')}
`;

  const moduleNames = [
    ...exports
      .filter((line) => !line.startsWith('//'))
      .map((line) =>
        line
          .split(' from ')[0]
          .replace('export { ', '')
          .replace(' }', '')
          .trim()
      ),
    ...signatureExports.map((line) =>
      line
        .split(' from ')[0]
        .replace('export { signatures as ', '')
        .replace(' }', '')
        .trim()
    ),
  ];

  const cjsContent = `/**
 * Generated Exports
 * This file is auto-generated. DO NOT EDIT UNLESS YOU KNOW WHAT YOU'RE DOING.
 */

${exports
  .map((line) => {
    if (line.startsWith('//')) return line;

    const [exportPart, importPart] = line.split(' from ');
    const varName = exportPart.replace('export { ', '').replace(' }', '');
    const importPath = importPart
      .replace(';', '')
      .replace(/["']/g, '')
      .replace('.ts', '');
    return `const ${varName} = require("${importPath}.cjs");`;
  })
  .join('\n')}

${signatureExports
  .map((line) => {
    const [exportPart, importPart] = line.split(' from ');
    const varName = exportPart
      .replace('export { signatures as ', '')
      .replace(' }', '');
    const importPath = importPart
      .replace(';', '')
      .replace(/["']/g, '')
      .replace('.ts', '');
    return `const ${varName} = require("${importPath}.cjs").signatures;`;
  })
  .join('\n')}

module.exports = {
${moduleNames.map((name) => `  ${name},`).join('\n')}
};
`;

  fs.writeFileSync('./dist/index.d.ts', tsContent);
  fs.writeFileSync('./dist/index.js', jsContent);
  fs.writeFileSync('./dist/index.cjs', cjsContent);

  updatePackageJsonExports({
    prod: NETWORKS.prod.networks.filter(
      (network) => !failedNetworks.includes(network)
    ),
    dev: NETWORKS.dev.networks.filter(
      (network) => !failedNetworks.includes(network)
    ),
  });

  console.log('✅ Successfully generated index files (ts, js, cjs)');
}

/**
 * Prints a summary of all network paths
 */
function printNetworkSummary(githubService: GitHubService): void {
  console.log('\n📊 Network Paths Summary:');
  console.log('========================');

  const networkPaths = githubService.getNetworkPaths();
  const successfulNetworks: string[] = [];
  const failedNetworks: string[] = [];

  Object.entries(networkPaths).forEach(([network, paths]) => {
    if (paths.status === 'error') {
      failedNetworks.push(network);
    } else {
      successfulNetworks.push(network);
    }
  });

  if (successfulNetworks.length > 0) {
    console.log('\n✅ Successfully Processed Networks:');
    successfulNetworks.forEach((network) => {
      const paths = networkPaths[network];
      console.log(`\n🌐 Network: ${network}`);
      console.log('  📁 ABIs Source:');
      console.log(`     ${paths.abis}`);
      console.log('  📄 Deployed Contracts:');
      console.log(`     ${paths.deployedContracts}`);
    });
  }

  if (failedNetworks.length > 0) {
    console.log('\n❌ Failed Networks:');
    failedNetworks.forEach((network) => {
      const paths = networkPaths[network];
      console.log(`\n🌐 Network: ${network}`);
      console.log(`  ❌ Error: ${paths.error}`);
      if (paths.abis) {
        console.log('  📁 ABIs Source:');
        console.log(`     ${paths.abis}`);
      }
      if (paths.deployedContracts) {
        console.log('  📄 Deployed Contracts:');
        console.log(`     ${paths.deployedContracts}`);
      }
    });
  }

  console.log('\n📈 Summary:');
  console.log(`   ✅ Successful: ${successfulNetworks.length} networks`);
  console.log(`   ❌ Failed: ${failedNetworks.length} networks`);
}

/**
 * Main execution
 */
export async function runContractsSync(): Promise<void> {
  console.log('🚀 Starting contract fetch process...');

  try {
    const githubService = new GitHubService(env.GH_API_KEY);
    const contractService = new ContractService(githubService);

    console.log(
      `📋 Processing production networks: ${NETWORKS.prod.networks.join(', ')}`
    );
    await Promise.all(
      NETWORKS.prod.networks.map(
        contractService.updateProdCache.bind(contractService)
      )
    );

    console.log(`📋 Processing development branch`);
    await contractService.updateDevCache();

    const networkPaths = githubService.getNetworkPaths();
    const failedNetworks = Object.entries(networkPaths)
      .filter(([_, paths]) => paths.status === 'error')
      .map(([network]) => network);

    generateIndexFiles(failedNetworks);
    printNetworkSummary(githubService);

    console.log('\n✨ All networks processed successfully');
  } catch (error: any) {
    const message = error?.message ?? error;
    console.error('💥 Process failed:', message);
    throw error;
  }
}

const thisFile = fileURLToPath(import.meta.url);
const invokedViaCli =
  typeof process.argv[1] === 'string' &&
  path.resolve(process.argv[1]) === thisFile;

if (invokedViaCli) {
  runContractsSync().catch(() => {
    process.exit(1);
  });
}
