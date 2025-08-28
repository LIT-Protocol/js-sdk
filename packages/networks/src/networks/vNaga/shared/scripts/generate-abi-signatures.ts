// Command: NETWORK_CONFIG=<path-to-lit-assets>/lit-assets/blockchain/contracts/networkContext.json bun run gen:local-network-context

import { generateSignaturesFromContext } from '@lit-protocol/contracts/custom-network-signatures';

const NETWORK_CONFIG = process.env['NETWORK_CONFIG'] as string;
const NETWORK_NAME = process.env['NETWORK_NAME'] as string;
const DIRECTORY_NAME = process.env['DIRECTORY_NAME'] as string;

if (!NETWORK_CONFIG) {
  throw new Error(
    '❌ NETWORK_CONFIG is not set. Please set it in your .env file. This is where your locally generated networkContext.json is located, usually in ./lit-assets/blockchain/contracts/networkContext.json.'
  );
}

if (!NETWORK_NAME) {
  throw new Error(
    '❌ NETWORK_NAME is not set. Please set it in your .env file. Usually it is `naga-develop` for local development.'
  );
}

if (!DIRECTORY_NAME) {
  throw new Error(
    '❌ DIRECTORY_NAME is not set. Please set it in your .env file. Usually this is inside the ./env directory inside your network (eg. vNaga) directory.'
  );
}

console.log('✅ NETWORK_CONFIG:', NETWORK_CONFIG);
console.log('✅ NETWORK_NAME:', NETWORK_NAME);
console.log('✅ DIRECTORY_NAME:', DIRECTORY_NAME);

async function main() {
  await generateSignaturesFromContext({
    jsonFilePath: NETWORK_CONFIG,
    networkName: NETWORK_NAME,
    outputDir: `../../envs/${DIRECTORY_NAME}/generated`,
    useScriptDirectory: true,

    // @ts-ignore
    callerPath: import.meta.url,
  });
}

// gogogo!
main().catch(console.error);
